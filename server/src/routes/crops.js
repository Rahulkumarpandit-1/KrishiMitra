const express = require('express');
const { db } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/crops – list reference crops
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM crops';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY name ASC';

    const crops = db.prepare(query).all(...params);
    const parsed = crops.map(c => ({
      ...c,
      stages: c.stages ? (typeof c.stages === 'string' ? JSON.parse(c.stages) : c.stages) : []
    }));
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Get crops error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch crops' });
  }
});

// GET /api/crops/:id – single crop
router.get('/:id', (req, res) => {
  try {
    const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    crop.stages = crop.stages ? (typeof crop.stages === 'string' ? JSON.parse(crop.stages) : crop.stages) : [];
    res.json({ success: true, data: crop });
  } catch (error) {
    console.error('Get crop detail error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch crop' });
  }
});

// POST /api/crops (admin)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, name_hi, category, avg_duration_days, stages } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Crop name is required' });
    }

    const stagesStr = stages ? (typeof stages === 'string' ? stages : JSON.stringify(stages)) : null;

    const result = db.prepare(
      'INSERT INTO crops (name, name_hi, category, avg_duration_days, stages) VALUES (?, ?, ?, ?, ?)'
    ).run(name, name_hi || null, category || null, avg_duration_days || null, stagesStr);

    const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(result.lastInsertRowid);
    crop.stages = crop.stages ? (typeof crop.stages === 'string' ? JSON.parse(crop.stages) : crop.stages) : [];
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    console.error('Create crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create crop' });
  }
});

// PUT /api/crops/:id (admin)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    const { name, name_hi, category, avg_duration_days, stages } = req.body;
    const stagesStr = stages ? (typeof stages === 'string' ? stages : JSON.stringify(stages)) : null;

    db.prepare(`
      UPDATE crops SET
        name = COALESCE(?, name),
        name_hi = COALESCE(?, name_hi),
        category = COALESCE(?, category),
        avg_duration_days = COALESCE(?, avg_duration_days),
        stages = COALESCE(?, stages)
      WHERE id = ?
    `).run(name ?? null, name_hi ?? null, category ?? null, avg_duration_days ?? null, stagesStr, req.params.id);

    const updated = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
    updated.stages = updated.stages ? (typeof updated.stages === 'string' ? JSON.parse(updated.stages) : updated.stages) : [];
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update crop' });
  }
});

// DELETE /api/crops/:id (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    const inUse = db.prepare('SELECT COUNT(*) as count FROM farmer_crops WHERE crop_id = ?').get(req.params.id).count;
    if (inUse > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete crop that is in use by farmers' });
    }

    db.prepare('DELETE FROM crops WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Crop deleted successfully' } });
  } catch (error) {
    console.error('Delete crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete crop' });
  }
});

module.exports = router;
