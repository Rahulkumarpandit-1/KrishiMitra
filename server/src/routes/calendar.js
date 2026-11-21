const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { generateCalendar } = require('../services/calendar');

const router = express.Router();

// GET /api/calendar?farmer_crop_id=X
router.get('/', requireAuth, (req, res) => {
  try {
    const { farmer_crop_id } = req.query;

    if (!farmer_crop_id) {
      return res.status(400).json({ success: false, error: 'farmer_crop_id query parameter is required' });
    }

    const fc = db.prepare('SELECT id FROM farmer_crops WHERE id = ? AND user_id = ?').get(farmer_crop_id, req.user.id);
    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    const events = db.prepare(
      'SELECT * FROM farming_calendar WHERE farmer_crop_id = ? ORDER BY scheduled_date ASC'
    ).all(farmer_crop_id);

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Get calendar error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch calendar' });
  }
});

// POST /api/calendar/generate – generate calendar for a farmer crop
router.post('/generate', requireAuth, (req, res) => {
  try {
    const { farmer_crop_id } = req.body;

    if (!farmer_crop_id) {
      return res.status(400).json({ success: false, error: 'farmer_crop_id is required' });
    }

    const farmerCrop = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.stages, c.avg_duration_days
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.id = ? AND fc.user_id = ?
    `).get(farmer_crop_id, req.user.id);

    if (!farmerCrop) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    if (!farmerCrop.sowing_date) {
      return res.status(400).json({ success: false, error: 'Sowing date required to generate calendar' });
    }

    // Clear existing calendar
    db.prepare('DELETE FROM farming_calendar WHERE farmer_crop_id = ?').run(farmer_crop_id);

    // Generate and insert calendar events
    const events = generateCalendar(farmerCrop);
    const insert = db.prepare(
      'INSERT INTO farming_calendar (farmer_crop_id, activity_type, title, description, scheduled_date) VALUES (?, ?, ?, ?, ?)'
    );

    const insertMany = db.transaction((events) => {
      for (const event of events) {
        insert.run(farmer_crop_id, event.activity_type, event.title, event.description, event.scheduled_date);
      }
    });

    insertMany(events);

    const calendar = db.prepare(
      'SELECT * FROM farming_calendar WHERE farmer_crop_id = ? ORDER BY scheduled_date ASC'
    ).all(farmer_crop_id);

    res.status(201).json({ success: true, data: calendar });
  } catch (error) {
    console.error('Generate calendar error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to generate calendar' });
  }
});

// PUT /api/calendar/:id – mark complete/skip
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status required: pending, completed, or skipped' });
    }

    const event = db.prepare(`
      SELECT cal.* FROM farming_calendar cal
      JOIN farmer_crops fc ON cal.farmer_crop_id = fc.id
      WHERE cal.id = ? AND fc.user_id = ?
    `).get(id, req.user.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Calendar event not found' });
    }

    db.prepare('UPDATE farming_calendar SET status = ? WHERE id = ?').run(status, id);

    const updated = db.prepare('SELECT * FROM farming_calendar WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update calendar error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update calendar event' });
  }
});

module.exports = router;
