const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { fetchWeather, generateWeatherAlerts } = require('../services/weather');
const { db } = require('../config/db');

const router = express.Router();

// GET /api/weather?lat=X&lon=Y
router.get('/', requireAuth, async (req, res) => {
  try {
    let { lat, lon, lng } = req.query;
    lon = lon || lng;

    let latitude = parseFloat(lat);
    let longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      try {
        const profile = db.prepare('SELECT latitude, longitude FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
        if (profile && profile.latitude && profile.longitude) {
          latitude = profile.latitude;
          longitude = profile.longitude;
        } else {
          latitude = 28.6139; // New Delhi default
          longitude = 77.2090;
        }
      } catch (dbErr) {
        latitude = 28.6139;
        longitude = 77.2090;
      }
    }

    const weather = await fetchWeather(latitude, longitude);
    const alerts = generateWeatherAlerts(weather);
    res.json({
      success: true,
      data: {
        ...weather,
        alerts
      }
    });
  } catch (error) {
    console.error('Weather error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
  }
});

// GET /api/weather/alerts?lat=X&lon=Y
router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'lat and lon query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, error: 'Invalid latitude or longitude' });
    }

    const weather = await fetchWeather(latitude, longitude);
    const alerts = generateWeatherAlerts(weather);

    // Store alerts as notifications
    const insert = db.prepare(
      'INSERT INTO notifications (user_id, category, title, message, priority) VALUES (?, ?, ?, ?, ?)'
    );
    const insertAlerts = db.transaction((alerts) => {
      for (const alert of alerts) {
        insert.run(req.user.id, 'weather', alert.title, alert.message, alert.priority);
      }
    });

    if (alerts.length > 0) {
      insertAlerts(alerts);
    }

    res.json({ success: true, data: { weather, alerts } });
  } catch (error) {
    console.error('Weather alerts error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to generate weather alerts' });
  }
});

module.exports = router;
