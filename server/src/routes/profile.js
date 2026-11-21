const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile
router.put('/', requireAuth, (req, res) => {
  try {
    const {
      village, district, state, land_size, land_unit,
      soil_type, irrigation_available, irrigation_type,
      preferred_crops, latitude, longitude
    } = req.body;

    const existing = db.prepare('SELECT id FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
    if (!existing) {
      db.prepare('INSERT INTO farmer_profiles (user_id) VALUES (?)').run(req.user.id);
    }

    const stmt = db.prepare(`
      UPDATE farmer_profiles SET
        village = COALESCE(?, village),
        district = COALESCE(?, district),
        state = COALESCE(?, state),
        land_size = COALESCE(?, land_size),
        land_unit = COALESCE(?, land_unit),
        soil_type = COALESCE(?, soil_type),
        irrigation_available = COALESCE(?, irrigation_available),
        irrigation_type = COALESCE(?, irrigation_type),
        preferred_crops = COALESCE(?, preferred_crops),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude)
      WHERE user_id = ?
    `);

    stmt.run(
      village ?? null, district ?? null, state ?? null,
      land_size ?? null, land_unit ?? null, soil_type ?? null,
      irrigation_available ?? null, irrigation_type ?? null,
      preferred_crops ?? null, latitude ?? null, longitude ?? null,
      req.user.id
    );

    const updated = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

module.exports = router;
