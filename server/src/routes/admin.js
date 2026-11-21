const express = require('express');
const { db } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/farmers – list farmers with profiles
router.get('/farmers', requireAdmin, (req, res) => {
  try {
    const farmers = db.prepare(`
      SELECT u.id, u.name, u.mobile, u.role, u.preferred_language, u.created_at,
             fp.village, fp.district, fp.state, fp.land_size, fp.land_unit, fp.soil_type,
             fp.irrigation_available, fp.latitude, fp.longitude
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'farmer'
      ORDER BY u.created_at DESC
    `).all();

    res.json({ success: true, data: farmers });
  } catch (error) {
    console.error('Admin get farmers error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch farmers' });
  }
});

// GET /api/admin/stats
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const farmers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'").get().count;
    const totalCrops = db.prepare('SELECT COUNT(*) as count FROM farmer_crops').get().count;
    const activeCrops = db.prepare("SELECT COUNT(*) as count FROM farmer_crops WHERE status = 'active'").get().count;
    const conversations = db.prepare('SELECT COUNT(*) as count FROM assistant_conversations').get().count;
    const diseaseReports = db.prepare('SELECT COUNT(*) as count FROM disease_reports').get().count;
    const notifications = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
    const soilRecords = db.prepare('SELECT COUNT(*) as count FROM soil_records').get().count;
    const articles = db.prepare('SELECT COUNT(*) as count FROM knowledge_articles').get().count;

    res.json({
      success: true,
      data: {
        farmers,
        total_crops: totalCrops,
        active_crops: activeCrops,
        conversations,
        disease_reports: diseaseReports,
        notifications,
        soil_records: soilRecords,
        knowledge_articles: articles
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// CRUD for reference crops
// POST /api/admin/crops
router.post('/crops', requireAdmin, (req, res) => {
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
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    console.error('Admin create crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create crop' });
  }
});

// PUT /api/admin/crops/:id
router.put('/crops/:id', requireAdmin, (req, res) => {
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
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin update crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update crop' });
  }
});

// DELETE /api/admin/crops/:id
router.delete('/crops/:id', requireAdmin, (req, res) => {
  try {
    const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    // Check if crop is in use
    const inUse = db.prepare('SELECT COUNT(*) as count FROM farmer_crops WHERE crop_id = ?').get(req.params.id).count;
    if (inUse > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete crop that is in use by farmers' });
    }

    db.prepare('DELETE FROM crops WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Crop deleted successfully' } });
  } catch (error) {
    console.error('Admin delete crop error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete crop' });
  }
});

// CRUD for knowledge articles (admin)
// POST /api/admin/knowledge
router.post('/knowledge', requireAdmin, (req, res) => {
  try {
    const { category, crop_id, title, title_hi, content, content_hi, source } = req.body;

    if (!category || !title || !content) {
      return res.status(400).json({ success: false, error: 'category, title, and content are required' });
    }

    const result = db.prepare(
      'INSERT INTO knowledge_articles (category, crop_id, title, title_hi, content, content_hi, source) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(category, crop_id || null, title, title_hi || null, content, content_hi || null, source || null);

    const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error('Admin create article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create article' });
  }
});

// PUT /api/admin/knowledge/:id
router.put('/knowledge/:id', requireAdmin, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const { category, crop_id, title, title_hi, content, content_hi, source } = req.body;

    db.prepare(`
      UPDATE knowledge_articles SET
        category = COALESCE(?, category),
        crop_id = COALESCE(?, crop_id),
        title = COALESCE(?, title),
        title_hi = COALESCE(?, title_hi),
        content = COALESCE(?, content),
        content_hi = COALESCE(?, content_hi),
        source = COALESCE(?, source)
      WHERE id = ?
    `).run(category ?? null, crop_id ?? null, title ?? null, title_hi ?? null, content ?? null, content_hi ?? null, source ?? null, req.params.id);

    const updated = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin update article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update article' });
  }
});

// DELETE /api/admin/knowledge/:id
router.delete('/knowledge/:id', requireAdmin, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    db.prepare('DELETE FROM knowledge_articles WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Article deleted successfully' } });
  } catch (error) {
    console.error('Admin delete article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
});

module.exports = router;
