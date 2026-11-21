const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { generateToken } = require('../config/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, mobile, password, preferred_language } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'Name, mobile, and password are required' });
    }

    if (mobile.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid mobile number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Mobile number already registered' });
    }

    const password_hash = bcrypt.hashSync(password, 10);

    const insertUser = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, preferred_language) VALUES (?, ?, ?, ?)'
    );
    const result = insertUser.run(name, mobile, password_hash, preferred_language || 'en');
    const userId = result.lastInsertRowid;

    // Create empty farmer profile
    db.prepare('INSERT INTO farmer_profiles (user_id) VALUES (?)').run(userId);

    const token = generateToken({ id: userId, role: 'farmer', name });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, name, mobile, role: 'farmer', preferred_language: preferred_language || 'en' }
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, error: 'Mobile and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, role: user.role, name: user.name });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          preferred_language: user.preferred_language
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);

    res.json({
      success: true,
      data: {
        user: req.user,
        profile: profile || null
      }
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

module.exports = router;
