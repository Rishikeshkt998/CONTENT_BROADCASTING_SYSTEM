CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('principal', 'teacher')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT REFERENCES users(id),
  status INT NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2, 3)), -- 0: uploaded, 1: pending, 2: approved, 3: rejected
  rejection_reason TEXT,
  approved_by INT REFERENCES users(id),
  approved_at TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  rotation_duration INT, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Slots (Subject-based)
CREATE TABLE IF NOT EXISTS content_slots (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Schedule
CREATE TABLE IF NOT EXISTS content_schedule (
  id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content(id),
  slot_id INT REFERENCES content_slots(id),
  rotation_order INT,
  duration INT, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data for testing
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Principal', 'principal@school.com', '$2b$10$XQJ0a6k9V.X.H/W4q8g2/.wW8n/F9lR5sD0v.T0m9p.J8g9gQ.q', 'principal'), -- pass: password
('Math Teacher', 'math@school.com', '$2b$10$XQJ0a6k9V.X.H/W4q8g2/.wW8n/F9lR5sD0v.T0m9p.J8g9gQ.q', 'teacher');
