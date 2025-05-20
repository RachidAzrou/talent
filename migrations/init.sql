-- Maak de users tabel aan
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  password_change_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Maak de clients tabel aan
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_function TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Maak de candidates tabel aan
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  current_position TEXT,
  profile TEXT,
  experience JSONB,
  education JSONB,
  skills JSONB,
  languages JSONB,
  certifications JSONB,
  hobbies TEXT,
  birth_date TEXT,
  summary TEXT,
  availability TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  resume_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Maak de applications tabel aan
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  current_position TEXT,
  profile TEXT,
  experience JSONB,
  education JSONB,
  skills JSONB,
  languages JSONB,
  certifications JSONB,
  hobbies TEXT,
  birth_date TEXT,
  summary TEXT,
  availability TEXT,
  cover_letter TEXT,
  resume_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Voeg admin gebruikers toe
INSERT INTO users (username, password_hash, email, first_name, last_name, role, password_change_required)
VALUES 
  ('admin', '$2b$10$1Kpo6H4tX2w7flfs4NVc8ehIeuVMPJjKUNfbNIuVVNMqH/Sd2KMKK', 'admin@tecnarit.com', 'Admin', 'User', 'admin', false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (username, password_hash, email, first_name, last_name, role, password_change_required)
VALUES 
  ('razrou', '$2b$10$WN.jUgf8qyM1WE98UaqNhOAmQTbXmX9uMOl1oAN.6zAblBxds3X4i', 'razrou@outlook.be', 'Raz', 'Rou', 'admin', false)
ON CONFLICT (email) DO NOTHING;