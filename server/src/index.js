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
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('mkdirSync uploadsDir:', err.message);
  }
}

// Middleware
app.use(cors({
  origin: true,
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

// Seed default demo accounts and initial crops
function seedDefaultUsers() {
  const defaultPw = bcrypt.hashSync('password123', 10);
  const adminPw = bcrypt.hashSync('admin123', 10);

  // 1. Admin
  const adminMobile = '9999999999';
  if (!db.prepare('SELECT id FROM users WHERE mobile = ?').get(adminMobile)) {
    const res = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run('KrishiMitra Admin', adminMobile, adminPw, 'admin', 'en');
    db.prepare('INSERT OR IGNORE INTO farmer_profiles (user_id, village, district, state) VALUES (?, ?, ?, ?)').run(
      res.lastInsertRowid, 'HQ', 'Central', 'Delhi'
    );
  }

  // 2. Demo Farmer (Ramesh Patel)
  const rameshMobile = '9876543210';
  let ramesh = db.prepare('SELECT id FROM users WHERE mobile = ?').get(rameshMobile);
  if (!ramesh) {
    const res = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run('Ramesh Patel', rameshMobile, defaultPw, 'farmer', 'hi');
    const rameshId = Number(res.lastInsertRowid);
    db.prepare(`
      INSERT OR IGNORE INTO farmer_profiles (
        user_id, village, district, state, land_size, soil_type, irrigation_available, irrigation_type, preferred_crops
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rameshId, 'Khed', 'Pune', 'Maharashtra', 5.5, 'black', 1, 'Drip', 'Onion, Wheat');

    // Seed Active Crop: Onion
    const sowing = new Date();
    sowing.setDate(sowing.getDate() - 42); // 42 days ago
    const cropRes = db.prepare(`
      INSERT INTO farmer_crops (user_id, crop_id, variety, sowing_date, field_size, field_unit, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rameshId, 3, 'Nashik Red', sowing.toISOString().slice(0, 10), 2.5, 'acres', 'active', 'Regular drip irrigation applied.');

    // Seed some activities for Onion
    const cropId = Number(cropRes.lastInsertRowid);
    db.prepare(`
      INSERT INTO farming_activities (farmer_crop_id, activity_type, description, activity_date)
      VALUES (?, ?, ?, ?)
    `).run(cropId, 'irrigation', 'Drip cycle run for 2 hours in morning', new Date().toISOString().slice(0, 10));

    // Seed calendar tasks
    const calDate = new Date();
    calDate.setDate(calDate.getDate() + 2);
    db.prepare(`
      INSERT INTO farming_calendar (farmer_crop_id, activity_type, title, description, scheduled_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(cropId, 'weeding', 'Field Weeding & Soil Aeration', 'Manual weed removal in onion rows', calDate.toISOString().slice(0, 10));
  }

  // 3. User Rahul (6299400242)
  const rahulMobile = '6299400242';
  let rahul = db.prepare('SELECT id FROM users WHERE mobile = ?').get(rahulMobile);
  if (!rahul) {
    const res = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run('Rahul', rahulMobile, defaultPw, 'farmer', 'en');
    const rahulId = Number(res.lastInsertRowid);
    db.prepare(`
      INSERT OR IGNORE INTO farmer_profiles (
        user_id, village, district, state, land_size, soil_type, irrigation_available, irrigation_type, preferred_crops
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rahulId, 'Rampur', 'Patna', 'Bihar', 3.0, 'alluvial', 1, 'Borewell', 'Wheat, Rice');

    const sowing = new Date();
    sowing.setDate(sowing.getDate() - 25);
    db.prepare(`
      INSERT INTO farmer_crops (user_id, crop_id, variety, sowing_date, field_size, field_unit, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(rahulId, 1, 'HD-2967', sowing.toISOString().slice(0, 10), 3.0, 'acres', 'active', 'Crown root stage ongoing.');
  }
}
seedDefaultUsers();

// Health check route with active database connection check
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const cropCount = db.prepare('SELECT COUNT(*) as count FROM crops').get().count;
    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        engine: 'SQLite (Active & Initialized)',
        registered_users: Number(userCount),
        reference_crops: Number(cropCount),
        app: 'KrishiMitra Backend',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'error: ' + err.message,
        timestamp: new Date().toISOString()
      }
    });
  }
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

// Start server (only if run directly, not in Vercel serverless)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`KrishiMitra Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

module.exports = app;
