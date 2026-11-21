const express = require('express');
const path = require('path');
const multer = require('multer');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { analyzeImage } = require('../services/disease');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'disease-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    const imagePath = req.file.filename;

    // Get crop info if provided
    let cropName = null;
    if (crop_id) {
      const crop = db.prepare('SELECT name FROM crops WHERE id = ?').get(crop_id);
      if (crop) cropName = crop.name;
    }

    // Analyze the image
    const analysis = await analyzeImage(req.file.path, cropName);

    // Save report
    const result = db.prepare(
      'INSERT INTO disease_reports (user_id, crop_id, image_path, diagnosis, confidence, suggestions) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.id,
      crop_id || null,
      imagePath,
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
    res.status(500).json({ success: false, error: 'Failed to analyze image' });
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
