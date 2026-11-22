const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(process.env.LAMBDA_TASK_ROOT);
const dbPath = isVercel
  ? path.join('/tmp', 'krishimitra.db')
  : path.join(__dirname, '..', '..', 'data', 'krishimitra.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.warn('mkdirSync dataDir:', err.message);
  }
}

// If on Vercel and seed DB exists in repo, copy it to /tmp
if (isVercel && !fs.existsSync(dbPath)) {
  const repoSeedDb = path.join(__dirname, '..', '..', 'data', 'krishimitra.db');
  if (fs.existsSync(repoSeedDb)) {
    try {
      fs.copyFileSync(repoSeedDb, dbPath);
    } catch {
      // ignore
    }
  }
}

const db = new DatabaseSync(dbPath);

// Enable pragmas for high performance and integrity
db.exec(`
  PRAGMA journal_mode = ${isVercel ? 'DELETE' : 'WAL'};
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -64000;
  PRAGMA temp_store = MEMORY;
  PRAGMA foreign_keys = ON;
`);

// Add transaction helper compatible with better-sqlite3 API
db.transaction = function (fn) {
  return function (...args) {
    db.exec('BEGIN TRANSACTION');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
};

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'farmer' CHECK(role IN ('farmer','admin')),
      preferred_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farmer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      village TEXT,
      district TEXT,
      state TEXT,
      land_size REAL,
      land_unit TEXT DEFAULT 'acres',
      soil_type TEXT,
      irrigation_available INTEGER DEFAULT 0,
      irrigation_type TEXT,
      preferred_crops TEXT,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_hi TEXT,
      category TEXT,
      avg_duration_days INTEGER,
      stages TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS farmer_crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      crop_id INTEGER NOT NULL,
      variety TEXT,
      sowing_date DATE,
      field_size REAL,
      field_unit TEXT DEFAULT 'acres',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','harvested','cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS farming_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_crop_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT,
      activity_date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_crop_id) REFERENCES farmer_crops(id)
    );

    CREATE TABLE IF NOT EXISTS farming_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_crop_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_date DATE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','skipped')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_crop_id) REFERENCES farmer_crops(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assistant_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      crop_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS assistant_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES assistant_conversations(id)
    );

    CREATE TABLE IF NOT EXISTS disease_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      crop_id INTEGER,
      image_path TEXT,
      diagnosis TEXT,
      confidence TEXT,
      suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS soil_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      soil_type TEXT,
      ph REAL,
      nitrogen REAL,
      phosphorus REAL,
      potassium REAL,
      organic_carbon REAL,
      notes TEXT,
      test_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      crop_id INTEGER,
      title TEXT NOT NULL,
      title_hi TEXT,
      content TEXT NOT NULL,
      content_hi TEXT,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    -- Performance Indexes for High Query Efficiency
    CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
    CREATE INDEX IF NOT EXISTS idx_farmer_crops_user_id ON farmer_crops(user_id);
    CREATE INDEX IF NOT EXISTS idx_farmer_crops_crop_id ON farmer_crops(crop_id);
    CREATE INDEX IF NOT EXISTS idx_activities_crop_id ON farming_activities(farmer_crop_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_crop_id ON farming_calendar(farmer_crop_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON farming_calendar(scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_disease_reports_user ON disease_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_soil_records_user ON soil_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_assistant_conv_user ON assistant_conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_assistant_msg_conv ON assistant_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_articles(category);
  `);

  console.log('Database initialized successfully with performance indexes');
}

module.exports = { db, initializeDatabase };
