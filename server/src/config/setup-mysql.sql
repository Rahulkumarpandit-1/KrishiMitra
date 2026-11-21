-- KrishiMitra MySQL Schema & Initial Seed Data
-- Database: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS krishimitra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE krishimitra;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('farmer','admin') DEFAULT 'farmer',
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  land_size DECIMAL(10,2),
  land_unit VARCHAR(20) DEFAULT 'acres',
  soil_type VARCHAR(50),
  irrigation_available TINYINT(1) DEFAULT 0,
  irrigation_type VARCHAR(50),
  preferred_crops VARCHAR(255),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Reference Crops
CREATE TABLE IF NOT EXISTS crops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100),
  category VARCHAR(50),
  avg_duration_days INT,
  stages JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Farmer Crops
CREATE TABLE IF NOT EXISTS farmer_crops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  crop_id INT NOT NULL,
  variety VARCHAR(100),
  sowing_date DATE,
  field_size DECIMAL(10,2),
  field_unit VARCHAR(20) DEFAULT 'acres',
  status ENUM('active','harvested','cancelled') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- 5. Farming Activities Log
CREATE TABLE IF NOT EXISTS farming_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_crop_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_crop_id) REFERENCES farmer_crops(id) ON DELETE CASCADE
);

-- 6. Farming Calendar
CREATE TABLE IF NOT EXISTS farming_calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_crop_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  status ENUM('pending','completed','skipped') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_crop_id) REFERENCES farmer_crops(id) ON DELETE CASCADE
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Assistant Conversations
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  crop_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- 9. Assistant Messages
CREATE TABLE IF NOT EXISTS assistant_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES assistant_conversations(id) ON DELETE CASCADE
);

-- 10. Disease Reports
CREATE TABLE IF NOT EXISTS disease_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  crop_id INT,
  image_path VARCHAR(255),
  diagnosis VARCHAR(255),
  confidence VARCHAR(50),
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- 11. Soil Records
CREATE TABLE IF NOT EXISTS soil_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  soil_type VARCHAR(100),
  ph DECIMAL(4,2),
  nitrogen DECIMAL(8,2),
  phosphorus DECIMAL(8,2),
  potassium DECIMAL(8,2),
  organic_carbon DECIMAL(5,2),
  notes TEXT,
  test_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Knowledge Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  crop_id INT,
  title VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255),
  content TEXT NOT NULL,
  content_hi TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- Seed Default Admin & Demo Users (Passwords: admin123, password123)
INSERT IGNORE INTO users (id, name, mobile, password_hash, role, preferred_language)
VALUES
(1, 'KrishiMitra Admin', '9999999999', '$2a$10$fVp.2aTf0t4ZzC3yV9kGzOOQvQY8qf18k1Jk9vP5eNqU6Hl4g8Uqm', 'admin', 'en'),
(2, 'Ramesh Patel', '9876543210', '$2a$10$wTqgI7Rk8U2wY4Z8.eZ.6e9ZpX6eP3y0U9H3k7fG5aU1n9L2q8Kqm', 'farmer', 'hi'),
(3, 'Rahul', '6299400242', '$2a$10$wTqgI7Rk8U2wY4Z8.eZ.6e9ZpX6eP3y0U9H3k7fG5aU1n9L2q8Kqm', 'farmer', 'en');

INSERT IGNORE INTO farmer_profiles (user_id, village, district, state, land_size, land_unit, soil_type, irrigation_available, irrigation_type)
VALUES
(1, 'HQ', 'Central', 'Delhi', 0, 'acres', 'alluvial', 1, 'canal'),
(2, 'Khed', 'Pune', 'Maharashtra', 5.5, 'acres', 'black', 1, 'drip'),
(3, 'Rampur', 'Patna', 'Bihar', 3.0, 'acres', 'alluvial', 1, 'borewell');
