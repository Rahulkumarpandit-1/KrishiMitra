const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { analyzeImage } = require('../services/disease');

// Ensure writable uploads directory (/tmp/uploads on Vercel)
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(process.env.LAMBDA_TASK_ROOT);
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('mkdirSync uploadsDir error:', err.message);
  }
}

// Memory storage to eliminate read-only filesystem errors on Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

const router = express.Router();

// POST /api/disease/analyze
router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }

    const { crop_id } = req.body;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = 'disease-' + uniqueSuffix + ext;

    // Persist to uploads folder if writable
    try {
      fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
    } catch (fsErr) {
      console.warn('Could not persist image to disk:', fsErr.message);
    }

    // Get crop info if provided
    let cropName = null;
    if (crop_id) {
      const crop = db.prepare('SELECT name FROM crops WHERE id = ?').get(crop_id);
      if (crop) cropName = crop.name;
    }

    // Analyze the image via AI / Agronomic Engine
    const analysis = await analyzeImage(req.file.buffer, cropName, req.file.originalname);

    // Save report in database
    const result = db.prepare(
      'INSERT INTO disease_reports (user_id, crop_id, image_path, diagnosis, confidence, suggestions) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.id,
      crop_id ? Number(crop_id) : null,
      filename,
      analysis.diagnosis,
      analysis.confidence,
      analysis.suggestions
    );

    const report = db.prepare('SELECT * FROM disease_reports WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Disease analyze error:', error.message);
    if (error.message.includes('Only JPEG')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Failed to analyze image: ' + error.message });
  }
});

// GET /api/disease/reports
router.get('/reports', requireAuth, (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT dr.*, c.name as crop_name
      FROM disease_reports dr
      LEFT JOIN crops c ON dr.crop_id = c.id
      WHERE dr.user_id = ?
      ORDER BY dr.created_at DESC
    `).all(req.user.id);

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Get disease reports error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch disease reports' });
  }
});

// GET /api/disease/reports/:id
router.get('/reports/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const report = db.prepare(`
      SELECT dr.*, c.name as crop_name
      FROM disease_reports dr
      LEFT JOIN crops c ON dr.crop_id = c.id
      WHERE dr.id = ? AND dr.user_id = ?
    `).get(id, req.user.id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Get disease report error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch disease report' });
  }
});

module.exports = router;
