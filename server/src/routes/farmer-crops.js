const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Helper: calculate current growth stage
function calculateGrowthStage(sowingDate, stagesJson) {
  if (!sowingDate || !stagesJson) return null;
  try {
    const stages = typeof stagesJson === 'string' ? JSON.parse(stagesJson) : stagesJson;
    const sowing = new Date(sowingDate);
    const now = new Date();
    const daysSinceSowing = Math.floor((now - sowing) / (1000 * 60 * 60 * 24));

    if (daysSinceSowing < 0) return { current_stage: 'Not yet sown', day: daysSinceSowing, stages };

    for (const stage of stages) {
      if (daysSinceSowing >= stage.start_day && daysSinceSowing <= stage.end_day) {
        return {
          current_stage: stage.name,
          day: daysSinceSowing,
          progress: Math.round(((daysSinceSowing - stage.start_day) / (stage.end_day - stage.start_day)) * 100),
          stages
        };
      }
    }

    return { current_stage: 'Harvested / Complete', day: daysSinceSowing, stages };
  } catch {
    return null;
  }
}

// GET /api/farmer-crops – list farmer's crops with growth stage
router.get('/', requireAuth, (req, res) => {
  try {
    const farmerCrops = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.name_hi as crop_name_hi, c.category, c.avg_duration_days, c.stages as crop_stages
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.user_id = ?
      ORDER BY fc.created_at DESC
    `).all(req.user.id);

    const enriched = farmerCrops.map(fc => ({
      ...fc,
      growth_stage: calculateGrowthStage(fc.sowing_date, fc.crop_stages),
      crop_stages: fc.crop_stages ? (typeof fc.crop_stages === 'string' ? JSON.parse(fc.crop_stages) : fc.crop_stages) : []
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Get farmer crops error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch farmer crops' });
  }
});

// POST /api/farmer-crops – add crop to farmer's field
router.post('/', requireAuth, (req, res) => {
  try {
    const { crop_id, variety, sowing_date, field_size, field_unit, notes } = req.body;

    if (!crop_id || !sowing_date) {
      return res.status(400).json({ success: false, error: 'crop_id and sowing_date are required' });
    }

    const crop = db.prepare('SELECT id FROM crops WHERE id = ?').get(crop_id);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    const result = db.prepare(
      'INSERT INTO farmer_crops (user_id, crop_id, variety, sowing_date, field_size, field_unit, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, crop_id, variety || null, sowing_date, field_size || null, field_unit || 'acres', notes || null);

    const created = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.name_hi as crop_name_hi, c.category, c.avg_duration_days, c.stages as crop_stages
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.id = ?
    `).get(result.lastInsertRowid);

    created.growth_stage = calculateGrowthStage(created.sowing_date, created.crop_stages);
    created.crop_stages = created.crop_stages ? (typeof created.crop_stages === 'string' ? JSON.parse(created.crop_stages) : created.crop_stages) : [];

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Add farmer crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to add crop' });
  }
});

// GET /api/farmer-crops/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const fc = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.name_hi as crop_name_hi, c.category, c.avg_duration_days, c.stages as crop_stages
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.id = ? AND (fc.user_id = ? OR ? = 'admin')
    `).get(id, req.user.id, req.user.role);

    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    fc.growth_stage = calculateGrowthStage(fc.sowing_date, fc.crop_stages);
    fc.crop_stages = fc.crop_stages ? (typeof fc.crop_stages === 'string' ? JSON.parse(fc.crop_stages) : fc.crop_stages) : [];

    res.json({ success: true, data: fc });
  } catch (error) {
    console.error('Get farmer crop detail error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch farmer crop' });
  }
});

// PUT /api/farmer-crops/:id
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const fc = db.prepare('SELECT * FROM farmer_crops WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    const { variety, sowing_date, field_size, field_unit, status, notes } = req.body;

    db.prepare(`
      UPDATE farmer_crops SET
        variety = COALESCE(?, variety),
        sowing_date = COALESCE(?, sowing_date),
        field_size = COALESCE(?, field_size),
        field_unit = COALESCE(?, field_unit),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ? AND user_id = ?
    `).run(variety ?? null, sowing_date ?? null, field_size ?? null, field_unit ?? null, status ?? null, notes ?? null, id, req.user.id);

    const updated = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.name_hi as crop_name_hi, c.category, c.avg_duration_days, c.stages as crop_stages
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.id = ?
    `).get(id);

    updated.growth_stage = calculateGrowthStage(updated.sowing_date, updated.crop_stages);
    updated.crop_stages = updated.crop_stages ? (typeof updated.crop_stages === 'string' ? JSON.parse(updated.crop_stages) : updated.crop_stages) : [];

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update farmer crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update farmer crop' });
  }
});

// DELETE /api/farmer-crops/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const fc = db.prepare('SELECT * FROM farmer_crops WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!fc) {
      return res.status(404).json({ success: false, error: 'Farmer crop not found' });
    }

    db.prepare('DELETE FROM farming_activities WHERE farmer_crop_id = ?').run(id);
    db.prepare('DELETE FROM farming_calendar WHERE farmer_crop_id = ?').run(id);
    db.prepare('DELETE FROM farmer_crops WHERE id = ?').run(id);

    res.json({ success: true, data: { message: 'Farmer crop deleted successfully' } });
  } catch (error) {
    console.error('Delete farmer crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete farmer crop' });
  }
});

module.exports = router;
