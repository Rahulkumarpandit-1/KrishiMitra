const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { chat } = require('../services/ai');

const router = express.Router();

function getRecommendationsForSoil(soil_type, ph, nitrogen, phosphorus, potassium) {
  const recs = [];
  const phVal = parseFloat(ph);
  if (!isNaN(phVal)) {
    if (phVal >= 6.0 && phVal <= 7.5) {
      recs.push({ crop: 'Wheat', reason: 'Wheat thrives in neutral to slightly alkaline soil (pH 6.0-7.5)' });
      recs.push({ crop: 'Maize', reason: 'Maize grows well in soil with pH 5.8-7.0' });
      recs.push({ crop: 'Rice', reason: 'Rice prefers slightly acidic to neutral soil' });
    }
    if (phVal >= 5.5 && phVal <= 6.5) {
      recs.push({ crop: 'Potato', reason: 'Potatoes prefer slightly acidic soil (pH 5.0-6.5)' });
      recs.push({ crop: 'Soybean', reason: 'Soybean grows well in slightly acidic soil' });
    }
    if (phVal >= 6.0 && phVal <= 7.0) {
      recs.push({ crop: 'Tomato', reason: 'Tomatoes prefer pH 6.0-7.0' });
      recs.push({ crop: 'Onion', reason: 'Onions grow well in pH 6.0-7.0' });
      recs.push({ crop: 'Mustard', reason: 'Mustard grows well in neutral soil' });
    }
    if (phVal >= 6.5 && phVal <= 8.0) {
      recs.push({ crop: 'Cotton', reason: 'Cotton tolerates slightly alkaline soil' });
      recs.push({ crop: 'Sugarcane', reason: 'Sugarcane prefers pH 6.5-7.5' });
    }
  }

  const soilLower = (soil_type || '').toLowerCase();
  if (soilLower.includes('clay') || soilLower.includes('loam')) {
    recs.push({ crop: 'Rice', reason: 'Clay/loam soil retains water well for paddy cultivation' });
    recs.push({ crop: 'Wheat', reason: 'Loamy soil is ideal for wheat cultivation' });
  }
  if (soilLower.includes('sandy')) {
    recs.push({ crop: 'Potato', reason: 'Sandy loam soil provides good drainage for potatoes' });
    recs.push({ crop: 'Onion', reason: 'Well-drained sandy loam is suitable for onions' });
  }
  if (soilLower.includes('black') || soilLower.includes('regur')) {
    recs.push({ crop: 'Cotton', reason: 'Black soil (regur) is ideal for cotton' });
    recs.push({ crop: 'Soybean', reason: 'Black soil retains moisture well for soybean' });
  }
  if (soilLower.includes('alluvial')) {
    recs.push({ crop: 'Rice', reason: 'Alluvial soil is very fertile for rice' });
    recs.push({ crop: 'Wheat', reason: 'Alluvial soil is excellent for wheat' });
    recs.push({ crop: 'Sugarcane', reason: 'Alluvial soil is suitable for sugarcane' });
  }
  if (soilLower.includes('red')) {
    recs.push({ crop: 'Maize', reason: 'Red soil with proper fertilization supports maize' });
    recs.push({ crop: 'Tomato', reason: 'Red soil is suitable for tomato cultivation' });
  }

  const seen = new Set();
  return recs.filter(r => {
    if (seen.has(r.crop)) return false;
    seen.add(r.crop);
    return true;
  });
}

// POST /api/soil – save soil record & return recommendations
router.post('/', requireAuth, async (req, res) => {
  try {
    const { soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, notes, test_date } = req.body;

    if (!soil_type) {
      return res.status(400).json({ success: false, error: 'soil_type is required' });
    }

    const result = db.prepare(
      'INSERT INTO soil_records (user_id, soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, notes, test_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, soil_type, ph || null, nitrogen || null, phosphorus || null, potassium || null, organic_carbon || null, notes || null, test_date || null);

    const record = db.prepare('SELECT * FROM soil_records WHERE id = ?').get(result.lastInsertRowid);
    const unique = getRecommendationsForSoil(soil_type, ph, nitrogen, phosphorus, potassium);
    const recommendationsText = unique.map((u, i) => `${i + 1}. ${u.crop}: ${u.reason}`).join('\n\n');

    res.status(201).json({
      success: true,
      data: {
        record,
        recommendations: recommendationsText,
        crop_list: unique
      }
    });
  } catch (error) {
    console.error('Add soil record error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to save soil record' });
  }
});

// GET /api/soil – list records
router.get('/', requireAuth, (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM soil_records WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get soil records error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch soil records' });
  }
});

// POST /api/soil/recommend – get crop recommendations
router.post('/recommend', requireAuth, async (req, res) => {
  try {
    const { soil_type, ph, nitrogen, phosphorus, potassium } = req.body;

    if (!soil_type) {
      return res.status(400).json({ success: false, error: 'soil_type is required' });
    }

    // Rule-based recommendations
    const recommendations = [];

    // pH based recommendations
    const phVal = parseFloat(ph);
    if (!isNaN(phVal)) {
      if (phVal >= 6.0 && phVal <= 7.5) {
        recommendations.push({ crop: 'Wheat', reason: 'Wheat thrives in neutral to slightly alkaline soil (pH 6.0-7.5)' });
        recommendations.push({ crop: 'Maize', reason: 'Maize grows well in soil with pH 5.8-7.0' });
        recommendations.push({ crop: 'Rice', reason: 'Rice prefers slightly acidic to neutral soil' });
      }
      if (phVal >= 5.5 && phVal <= 6.5) {
        recommendations.push({ crop: 'Potato', reason: 'Potatoes prefer slightly acidic soil (pH 5.0-6.5)' });
        recommendations.push({ crop: 'Soybean', reason: 'Soybean grows well in slightly acidic soil' });
      }
      if (phVal >= 6.0 && phVal <= 7.0) {
        recommendations.push({ crop: 'Tomato', reason: 'Tomatoes prefer pH 6.0-7.0' });
        recommendations.push({ crop: 'Onion', reason: 'Onions grow well in pH 6.0-7.0' });
      }
      if (phVal >= 6.5 && phVal <= 8.0) {
        recommendations.push({ crop: 'Cotton', reason: 'Cotton tolerates slightly alkaline soil' });
        recommendations.push({ crop: 'Sugarcane', reason: 'Sugarcane prefers pH 6.5-7.5' });
      }
      if (phVal >= 6.0 && phVal <= 7.0) {
        recommendations.push({ crop: 'Mustard', reason: 'Mustard grows well in neutral soil' });
      }
    }

    // Soil type based recommendations
    const soilLower = soil_type.toLowerCase();
    if (soilLower.includes('clay') || soilLower.includes('loam')) {
      recommendations.push({ crop: 'Rice', reason: 'Clay/loam soil retains water well for paddy cultivation' });
      recommendations.push({ crop: 'Wheat', reason: 'Loamy soil is ideal for wheat cultivation' });
    }
    if (soilLower.includes('sandy') || soilLower.includes('loam')) {
      recommendations.push({ crop: 'Potato', reason: 'Sandy loam soil provides good drainage for potatoes' });
      recommendations.push({ crop: 'Onion', reason: 'Well-drained sandy loam is suitable for onions' });
    }
    if (soilLower.includes('black') || soilLower.includes('regur')) {
      recommendations.push({ crop: 'Cotton', reason: 'Black soil (regur) is ideal for cotton' });
      recommendations.push({ crop: 'Soybean', reason: 'Black soil retains moisture well for soybean' });
    }
    if (soilLower.includes('alluvial')) {
      recommendations.push({ crop: 'Rice', reason: 'Alluvial soil is very fertile for rice' });
      recommendations.push({ crop: 'Wheat', reason: 'Alluvial soil is excellent for wheat' });
      recommendations.push({ crop: 'Sugarcane', reason: 'Alluvial soil is suitable for sugarcane' });
    }
    if (soilLower.includes('red')) {
      recommendations.push({ crop: 'Maize', reason: 'Red soil with proper fertilization supports maize' });
      recommendations.push({ crop: 'Tomato', reason: 'Red soil is suitable for tomato cultivation' });
    }

    // Deduplicate by crop name
    const seen = new Set();
    const unique = recommendations.filter(r => {
      if (seen.has(r.crop)) return false;
      seen.add(r.crop);
      return true;
    });

    // If Gemini is available, try AI recommendation too
    let aiRecommendation = null;
    try {
      const prompt = `Given soil data - Type: ${soil_type}, pH: ${ph || 'unknown'}, N: ${nitrogen || 'unknown'}, P: ${phosphorus || 'unknown'}, K: ${potassium || 'unknown'}. What crops would grow best? Give 3-5 specific recommendations for Indian farming conditions. Keep response brief.`;
      aiRecommendation = await chat(prompt, { user: { preferred_language: 'en' }, profile: {}, farmerCrops: [], history: [], language: 'en' });
    } catch {
      // AI unavailable, skip
    }

    res.json({
      success: true,
      data: {
        recommendations: unique,
        ai_recommendation: aiRecommendation
      }
    });
  } catch (error) {
    console.error('Soil recommend error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
});

module.exports = router;
