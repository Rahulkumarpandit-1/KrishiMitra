const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?').get(req.user.id).count;
    const notifications = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(req.user.id, limit, offset);

    const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).count;

    res.json({
      success: true,
      data: {
        notifications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        unread_count: unread
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, (req, res) => {
  try {
    const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);
    res.json({
      success: true,
      data: { count: unread ? Number(unread.count) : 0 },
      count: unread ? Number(unread.count) : 0
    });
  } catch (error) {
    console.error('Get unread count error:', error.message);
    res.json({ success: true, data: { count: 0 }, count: 0 });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, (req, res) => {
  try {
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);

    const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Mark read error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Notification deleted successfully' } });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

module.exports = router;
