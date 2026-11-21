const express = require('express');
const { db } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/knowledge – list articles
router.get('/', (req, res) => {
  try {
    const { category, crop_id } = req.query;
    let query = 'SELECT ka.*, c.name as crop_name FROM knowledge_articles ka LEFT JOIN crops c ON ka.crop_id = c.id WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND ka.category = ?';
      params.push(category);
    }

    if (crop_id) {
      query += ' AND ka.crop_id = ?';
      params.push(crop_id);
    }

    query += ' ORDER BY ka.created_at DESC';

    const articles = db.prepare(query).all(...params);
    res.json({ success: true, data: articles });
  } catch (error) {
    console.error('Get knowledge articles error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch articles' });
  }
});

// GET /api/knowledge/:id
router.get('/:id', (req, res) => {
  try {
    const article = db.prepare(`
      SELECT ka.*, c.name as crop_name
      FROM knowledge_articles ka
      LEFT JOIN crops c ON ka.crop_id = c.id
      WHERE ka.id = ?
    `).get(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Get knowledge article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch article' });
  }
});

// POST /api/knowledge (admin)
router.post('/', requireAdmin, (req, res) => {
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
    console.error('Create knowledge article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create article' });
  }
});

// PUT /api/knowledge/:id (admin)
router.put('/:id', requireAdmin, (req, res) => {
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
    console.error('Update knowledge article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update article' });
  }
});

// DELETE /api/knowledge/:id (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    db.prepare('DELETE FROM knowledge_articles WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Article deleted successfully' } });
  } catch (error) {
    console.error('Delete knowledge article error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
});

module.exports = router;
