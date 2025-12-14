-- Creating your Table:
CREATE TABLE IF NOT EXISTS events (
  event_id      VARCHAR(64) PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  start_at      DATETIME NOT NULL,
  venue         VARCHAR(200),
  banner_url    VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserting Sample Data:
INSERT INTO events (event_id, title, description, start_at, venue, banner_url)
VALUES
(
  'aws-buildercards-tournament-2025',
  'AWS Buildercards Tournament 2025',
  'Learn all about AWS BuilderCards.',
  '2025-12-28 16:00:00',
  'AWS MA Office, Boston',
  ''
),
(
  'aws-community-day-2025',
  'AWS Community Day 2025',
  'A day of learning and sharing with the AWS community.',
  '2025-12-30 16:00:00',
  'AWS NY Office, New York',
  ''
),
(
  'aws-meetup-boston-2025',
  'AWS User Group Boston Monthly Meetup 2025',
  'Join fellow builders for lightning talks, live demos, and networking with the AWS enthusiasts in Boston.',
  '2025-11-30 09:00:00',
  'AWS MA Office, Boston',
  ''
);

-- Users table for authentication and RBAC
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert a default admin user (password: admin123)
-- Password hash generated using bcrypt with salt rounds 10
INSERT INTO users (user_id, email, password_hash, full_name, role) 
VALUES (
    UUID(),
    '',
    '',
    'Admin User',
    'admin'
);

-- Add created_by field to events table to track who created the event
ALTER TABLE events 
ADD COLUMN created_by VARCHAR(36),
ADD CONSTRAINT fk_events_creator 
    FOREIGN KEY (created_by) REFERENCES users(user_id);