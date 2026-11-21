require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const { db, initializeDatabase } = require('./config/db');
const { seedCrops } = require('./data/crops-seed');
const { seedKnowledge } = require('./data/knowledge-seed');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const cropsRoutes = require('./routes/crops');
const farmerCropsRoutes = require('./routes/farmer-crops');
const activitiesRoutes = require('./routes/activities');
const calendarRoutes = require('./routes/calendar');
const weatherRoutes = require('./routes/weather');
const assistantRoutes = require('./routes/assistant');
const diseaseRoutes = require('./routes/disease');
const soilRoutes = require('./routes/soil');
const knowledgeRoutes = require('./routes/knowledge');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Initialize Database & Seed
initializeDatabase();
seedCrops(db);
seedKnowledge(db);

// Seed default admin user if not exists
function seedAdminUser() {
  const adminMobile = '9999999999';
  const existing = db.prepare('SELECT id FROM users WHERE mobile = ?').get(adminMobile);
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    const result = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run('KrishiMitra Admin', adminMobile, hash, 'admin', 'en');
    db.prepare('INSERT INTO farmer_profiles (user_id) VALUES (?)').run(result.lastInsertRowid);
    console.log(`Default admin user created: mobile: ${adminMobile}, password: admin123`);
  }
}
seedAdminUser();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      app: 'KrishiMitra Backend',
      timestamp: new Date().toISOString()
    }
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/farmer-crops', farmerCropsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`KrishiMitra Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = app;
