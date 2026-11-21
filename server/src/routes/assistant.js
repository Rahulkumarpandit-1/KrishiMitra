const express = require('express');
const { db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { chat, AGRI_VISUALS } = require('../services/ai');

const router = express.Router();

// Helper to match relevant agricultural visual
function matchAgriVisual(message, responseText) {
  const msgClean = (message || '').trim().toLowerCase();
  
  // Never attach image to simple greetings
  if (/^(hi|hey|hello|namaste|namaskar|pranam|नमस्ते|प्रणाम|हैलो|हाय)$/i.test(msgClean) || msgClean.length <= 4) {
    return null;
  }

  // Only match if user specifically asked or relevant topic is deeply discussed
  if (msgClean.includes('yellow') || msgClean.includes('पीली') || msgClean.includes('chlorosis') || msgClean.includes('rust') || msgClean.includes('धब्बा')) {
    return AGRI_VISUALS.yellow_leaves;
  }
  if (msgClean.includes('irriga') || msgClean.includes('सिंचाई') || msgClean.includes('पानी') || msgClean.includes('moisture') || msgClean.includes('drip')) {
    return AGRI_VISUALS.irrigation;
  }
  if (msgClean.includes('spray') || msgClean.includes('छिड़काव') || msgClean.includes('pesticide') || msgClean.includes('कीटनाशक')) {
    return AGRI_VISUALS.pesticide_spray;
  }
  if (msgClean.includes('fertiliz') || msgClean.includes('खाद') || msgClean.includes('urea') || msgClean.includes('यूरिया') || msgClean.includes('dap') || msgClean.includes('npk')) {
    return AGRI_VISUALS.fertilizer;
  }
  if (msgClean.includes('pest') || msgClean.includes('कीट') || msgClean.includes('aphid') || msgClean.includes('borer') || msgClean.includes('माहू') || msgClean.includes('scout') || msgClean.includes('photo') || msgClean.includes('image') || msgClean.includes('तस्वीर')) {
    return AGRI_VISUALS.pest_scouting;
  }
  return null;
}

// GET /api/assistant/conversations
router.get('/conversations', requireAuth, (req, res) => {
  try {
    const conversations = db.prepare(`
      SELECT ac.*, c.name as crop_name
      FROM assistant_conversations ac
      LEFT JOIN crops c ON ac.crop_id = c.id
      WHERE ac.user_id = ?
      ORDER BY ac.created_at DESC
    `).all(req.user.id);

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// POST /api/assistant/conversations
router.post('/conversations', requireAuth, (req, res) => {
  try {
    const { title, crop_id } = req.body;

    const result = db.prepare(
      'INSERT INTO assistant_conversations (user_id, title, crop_id) VALUES (?, ?, ?)'
    ).run(req.user.id, title || 'New Conversation', crop_id || null);

    const conversation = db.prepare('SELECT * FROM assistant_conversations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Create conversation error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

// GET /api/assistant/conversations/:id
router.get('/conversations/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    let conversation = db.prepare('SELECT * FROM assistant_conversations WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!conversation) {
      conversation = { id: Number(id), user_id: req.user.id, title: 'Farm Advisory', crop_id: null };
    }

    const rawMessages = db.prepare(
      'SELECT * FROM assistant_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(id);

    // Decorate messages with visual aids if applicable
    const messages = rawMessages.map(m => {
      if (m.role === 'assistant') {
        const visual = matchAgriVisual('', m.content);
        return visual ? { ...m, visual } : m;
      }
      return m;
    });

    res.json({ success: true, data: { conversation, messages } });
  } catch (error) {
    console.error('Get conversation error:', error.message);
    res.json({
      success: true,
      data: {
        conversation: { id: Number(req.params.id), title: 'Farm Advisory', crop_id: null },
        messages: []
      }
    });
  }
});

// GET /api/assistant/conversations/:id/messages
router.get('/conversations/:id/messages', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const conversation = db.prepare('SELECT * FROM assistant_conversations WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = db.prepare(
      'SELECT * FROM assistant_messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).all(id);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// POST /api/assistant/chat
router.post('/chat', requireAuth, async (req, res) => {
  try {
    let { conversation_id, message, crop_id } = req.body;
    const userQuery = message || req.body.query || req.body.text;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const cleanMessage = userQuery.trim();

    // Verify or auto-create conversation
    let conv = null;
    if (conversation_id) {
      conv = db.prepare('SELECT * FROM assistant_conversations WHERE id = ? AND user_id = ?').get(conversation_id, req.user.id);
    }

    if (!conv) {
      const title = cleanMessage.substring(0, 45) + (cleanMessage.length > 45 ? '...' : '');
      const ins = db.prepare(
        'INSERT INTO assistant_conversations (user_id, title, crop_id) VALUES (?, ?, ?)'
      ).run(req.user.id, title, crop_id ? Number(crop_id) : null);
      conversation_id = Number(ins.lastInsertRowid);
      conv = { id: conversation_id, user_id: req.user.id, title, crop_id };
    }

    // Save user message
    db.prepare('INSERT INTO assistant_messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversation_id, 'user', cleanMessage);

    // Build farmer context
    const profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
    const farmerCrops = db.prepare(`
      SELECT fc.*, c.name as crop_name, c.stages
      FROM farmer_crops fc
      JOIN crops c ON fc.crop_id = c.id
      WHERE fc.user_id = ? AND fc.status = 'active'
    `).all(req.user.id);

    const history = db.prepare(
      'SELECT role, content FROM assistant_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10'
    ).all(conversation_id);

    // Get AI response (Grok -> Gemini -> ICAR Agronomic Engine)
    const aiResponse = await chat(cleanMessage, {
      user: req.user,
      profile,
      farmerCrops,
      history,
      language: req.user.preferred_language
    });

    // Save assistant message
    db.prepare('INSERT INTO assistant_messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversation_id, 'assistant', aiResponse);

    // Match visual educational reference
    const visual = matchAgriVisual(cleanMessage, aiResponse);

    const assistantMsg = {
      id: Date.now(),
      conversation_id,
      role: 'assistant',
      content: aiResponse,
      visual,
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        conversation_id,
        user_message: cleanMessage,
        assistant_message: aiResponse,
        visual,
        message: assistantMsg
      }
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to process chat message: ' + error.message });
  }
});

// DELETE /api/assistant/conversations/:id
router.delete('/conversations/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const conversation = db.prepare('SELECT * FROM assistant_conversations WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    db.prepare('DELETE FROM assistant_messages WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM assistant_conversations WHERE id = ?').run(id);

    res.json({ success: true, data: { message: 'Conversation deleted successfully' } });
  } catch (error) {
    console.error('Delete conversation error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete conversation' });
  }
});

module.exports = router;
