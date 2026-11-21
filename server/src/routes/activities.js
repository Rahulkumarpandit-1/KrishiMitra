const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/activities – log activity
router.post('/', requireAuth, (req, res) => {
  try {
    const { farmer_crop_id, activity_type, description, activity_date, notes } = req.body;

    if (!farmer_crop_id || !activity_type || !activity_date) {
      return res.status(400).json({ success: false, error: 'farmer_crop_id, activity_type, and activity_date are required' });
    }

    // Verify ownership
    const fc = db.prepare('SELECT id FROM farmer_crops WHERE id = ? AND user_id = ?').get(farmer_crop_id, req.user.id);
    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    const result = db.prepare(
      'INSERT INTO farming_activities (farmer_crop_id, activity_type, description, activity_date, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(farmer_crop_id, activity_type, description || null, activity_date, notes || null);

    const created = db.prepare('SELECT * FROM farming_activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Add activity error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to add activity' });
  }
});

// GET /api/activities?farmer_crop_id=X
router.get('/', requireAuth, (req, res) => {
  try {
    const { farmer_crop_id } = req.query;

    if (!farmer_crop_id) {
      return res.status(400).json({ success: false, error: 'farmer_crop_id query parameter is required' });
    }

    // Verify ownership
    const fc = db.prepare('SELECT id FROM farmer_crops WHERE id = ? AND user_id = ?').get(farmer_crop_id, req.user.id);
    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    const activities = db.prepare(
      'SELECT * FROM farming_activities WHERE farmer_crop_id = ? ORDER BY activity_date DESC'
    ).all(farmer_crop_id);

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Get activities error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch activities' });
  }
});

// PUT /api/activities/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const activity = db.prepare(`
      SELECT fa.* FROM farming_activities fa
      JOIN farmer_crops fc ON fa.farmer_crop_id = fc.id
      WHERE fa.id = ? AND fc.user_id = ?
    `).get(id, req.user.id);

    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    const { activity_type, description, activity_date, notes } = req.body;

    db.prepare(`
      UPDATE farming_activities SET
        activity_type = COALESCE(?, activity_type),
        description = COALESCE(?, description),
        activity_date = COALESCE(?, activity_date),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(activity_type ?? null, description ?? null, activity_date ?? null, notes ?? null, id);

    const updated = db.prepare('SELECT * FROM farming_activities WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update activity error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const activity = db.prepare(`
      SELECT fa.* FROM farming_activities fa
      JOIN farmer_crops fc ON fa.farmer_crop_id = fc.id
      WHERE fa.id = ? AND fc.user_id = ?
    `).get(id, req.user.id);

    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    db.prepare('DELETE FROM farming_activities WHERE id = ?').run(id);
    res.json({ success: true, data: { message: 'Activity deleted successfully' } });
  } catch (error) {
    console.error('Delete activity error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete activity' });
  }
});

module.exports = router;
