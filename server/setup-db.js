/**
 * KrishiMitra Database Setup & Verification Script
 * Run with: node setup-db.js
 */

const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./src/config/db');
const { seedCrops } = require('./src/data/crops-seed');
const { seedKnowledge } = require('./src/data/knowledge-seed');

console.log('==================================================');
console.log('🌱 KrishiMitra Database Setup & Seeding');
console.log('==================================================');

// 1. Initialize all 12 tables
console.log('\n[1/4] Initializing database tables...');
initializeDatabase();

// 2. Seed Reference Crops
console.log('\n[2/4] Seeding agricultural crops reference data...');
seedCrops(db);

// 3. Seed Knowledge Articles
console.log('\n[3/4] Seeding ICAR agricultural knowledge articles...');
seedKnowledge(db);

// 4. Seed / Verify Demo Users
console.log('\n[4/4] Verifying and seeding default users...');

function ensureUser(name, mobile, password, role, lang, profileData = {}) {
  const existing = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
  const hash = bcrypt.hashSync(password, 10);
  let userId;

  if (existing) {
    db.prepare('UPDATE users SET password_hash = ?, name = ?, role = ? WHERE id = ?').run(hash, name, role, existing.id);
    userId = existing.id;
    console.log(`  ✓ Updated user: ${name} (${mobile}) - Password: ${password}`);
  } else {
    const res = db.prepare(
      'INSERT INTO users (name, mobile, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)'
    ).run(name, mobile, hash, role, lang);
    userId = res.lastInsertRowid;
    console.log(`  ✓ Created user: ${name} (${mobile}) - Password: ${password}`);
  }

  const existingProfile = db.prepare('SELECT id FROM farmer_profiles WHERE user_id = ?').get(userId);
  if (!existingProfile) {
    db.prepare(`
      INSERT INTO farmer_profiles (user_id, village, district, state, land_size, soil_type, irrigation_available, irrigation_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      profileData.village || null,
      profileData.district || null,
      profileData.state || null,
      profileData.land_size || 0,
      profileData.soil_type || 'alluvial',
      profileData.irrigation_available ? 1 : 0,
      profileData.irrigation_type || 'canal'
    );
  }
}

ensureUser('KrishiMitra Admin', '9999999999', 'admin123', 'admin', 'en', { village: 'Central', district: 'Delhi', state: 'Delhi' });
ensureUser('Ramesh Patel', '9876543210', 'password123', 'farmer', 'hi', { village: 'Khed', district: 'Pune', state: 'Maharashtra', land_size: 5.5, soil_type: 'black', irrigation_available: true, irrigation_type: 'drip' });
ensureUser('Rahul', '6299400242', 'password123', 'farmer', 'en', { village: 'Rampur', district: 'Patna', state: 'Bihar', land_size: 3.0, soil_type: 'alluvial', irrigation_available: true, irrigation_type: 'borewell' });

console.log('\n==================================================');
console.log('✅ DATABASE SETUP COMPLETED SUCCESSFULLY!');
console.log('==================================================');
console.log('You can now log in with any of these accounts:');
console.log('1. Admin:   Mobile: 9999999999 | Password: admin123');
console.log('2. Farmer:  Mobile: 9876543210 | Password: password123');
console.log('3. Rahul:   Mobile: 6299400242 | Password: password123');
console.log('==================================================\n');
