#!/bin/sh
# Migration script for PostgreSQL with master data

echo "Running DB migrations..."
PGPASSWORD=${POSTGRES_PASSWORD:-postgres123} psql -h ${POSTGRES_HOST:-db} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-financeapp} -c "
-- Create tables if they don't exist

-- Family Members
CREATE TABLE IF NOT EXISTS family_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  color VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Goals
CREATE TABLE IF NOT EXISTS financial_goals (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  target_amount NUMERIC(18, 2) NOT NULL,
  current_amount NUMERIC(18, 2) DEFAULT 0,
  deadline DATE NOT NULL,
  category VARCHAR(20) NOT NULL,
  notes TEXT,
  type VARCHAR(50),
  start_date DATE,
  priority VARCHAR(10),
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gold Investments
CREATE TABLE IF NOT EXISTS gold_investments (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  quantity NUMERIC(10, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(12, 2) NOT NULL,
  current_price NUMERIC(12, 2) NOT NULL,
  value NUMERIC(14, 2) NOT NULL,
  location VARCHAR(200),
  notes TEXT,
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Savings Accounts
CREATE TABLE IF NOT EXISTS savings_accounts (
  id VARCHAR(36) PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_type VARCHAR(20) NOT NULL,
  balance NUMERIC(14, 2) DEFAULT 0,
  interest_rate NUMERIC(5, 2) DEFAULT 0,
  branch_name VARCHAR(100),
  ifsc_code VARCHAR(20),
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  nominees TEXT[]
);

-- Stocks
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(36) PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  company_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  purchase_price NUMERIC(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  current_price NUMERIC(10, 2),
  sector VARCHAR(50),
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  value NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * current_price) STORED,
  investment_value NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * purchase_price) STORED,
  gain_loss NUMERIC(14, 2) GENERATED ALWAYS AS ((quantity * current_price) - (quantity * purchase_price)) STORED
);

-- Fixed Deposits
CREATE TABLE IF NOT EXISTS fixed_deposits (
  id VARCHAR(36) PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  term_months INTEGER NOT NULL,
  fd_number VARCHAR(50),
  is_auto_renewal BOOLEAN DEFAULT FALSE,
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  principal NUMERIC(14, 2),
  maturity_amount NUMERIC(14, 2),
  account_number VARCHAR(50)
);

-- SIP Investments
CREATE TABLE IF NOT EXISTS sip_investments (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  fund_type VARCHAR(50) NOT NULL,
  units NUMERIC(14, 4),
  current_nav NUMERIC(10, 2),
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  current_value NUMERIC(14, 2),
  returns NUMERIC(12, 2),
  returns_percent NUMERIC(6, 2),
  type VARCHAR(50),
  duration INTEGER
);

-- Insurance Policies
CREATE TABLE IF NOT EXISTS insurance_policies (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  policy_number VARCHAR(50) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  cover_amount NUMERIC(14, 2) NOT NULL,
  premium NUMERIC(12, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  documents TEXT[],
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Provident Fund
CREATE TABLE IF NOT EXISTS provident_fund (
  id VARCHAR(36) PRIMARY KEY,
  account_number VARCHAR(50) NOT NULL,
  employee_contribution NUMERIC(14, 2) DEFAULT 0,
  employer_contribution NUMERIC(14, 2) DEFAULT 0,
  total_balance NUMERIC(14, 2) DEFAULT 0,
  interest_rate NUMERIC(5, 2),
  start_date DATE,
  family_member_id VARCHAR(36) REFERENCES family_members(id),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  employer_name VARCHAR(100),
  monthly_contribution NUMERIC(12, 2)
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  stock_price_alert_threshold NUMERIC(5, 2) DEFAULT 5.0,
  stock_api_key VARCHAR(100),
  app_name VARCHAR(100) DEFAULT 'Money Flow Guardian',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE IF NOT EXISTS audit_records (
  id VARCHAR(36) PRIMARY KEY,
  entity_id VARCHAR(36) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id VARCHAR(36) NOT NULL,
  details JSONB
);

-- Application Users
CREATE TABLE IF NOT EXISTS app_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Insert some initial master data

-- Family Members
INSERT INTO family_members (id, name, relationship, date_of_birth, color, is_active, notes, updated_at)
VALUES
  ('fam-001', 'John Smith', 'Self', '1985-04-15', '#4f46e5', true, 'Primary account holder', NOW()),
  ('fam-002', 'Jane Smith', 'Spouse', '1987-09-22', '#ec4899', true, 'Spouse account holder', NOW()),
  ('fam-003', 'Emma Smith', 'Daughter', '2015-06-10', '#14b8a6', true, NULL, NOW()),
  ('fam-004', 'Michael Smith', 'Son', '2018-01-05', '#f97316', true, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  relationship = EXCLUDED.relationship,
  date_of_birth = EXCLUDED.date_of_birth,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Financial Goal Categories
INSERT INTO financial_goals (id, name, target_amount, current_amount, deadline, category, notes, priority, family_member_id)
VALUES
  ('goal-001', 'Emergency Fund', 500000, 350000, '2025-12-31', 'Savings', 'Six months of expenses', 'High', 'fam-001'),
  ('goal-002', 'Retirement Fund', 10000000, 2500000, '2045-04-15', 'Retirement', 'Retirement corpus target', 'Medium', 'fam-001'),
  ('goal-003', 'Emma''s Education', 5000000, 1000000, '2032-06-01', 'Education', 'College education fund', 'High', 'fam-003')
ON CONFLICT (id) DO NOTHING;

-- Clear the existing data first to ensure proper initialization
DELETE FROM user_settings WHERE id = 'settings-001';
DELETE FROM app_users WHERE id = 'user-001';

-- Add Admin User
INSERT INTO app_users (id, email, password_hash, name, role, is_active)
VALUES
  ('user-001', 'thanki.kaushik@gmail.com', '$2a$10$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', 'Kaushik Thanki', 'admin', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Add Default User Settings
INSERT INTO user_settings (id, user_id, stock_price_alert_threshold, app_name, stock_api_key)
VALUES
  ('settings-001', 'user-001', 5.0, 'Money Flow Guardian', 'LR78N65XUDF2EZDB')
ON CONFLICT (id) DO UPDATE SET
  stock_price_alert_threshold = EXCLUDED.stock_price_alert_threshold,
  app_name = EXCLUDED.app_name,
  stock_api_key = EXCLUDED.stock_api_key;

-- Fixed Deposits data will be added by users

-- Gold Investments data will be added by users

-- Savings Accounts data will be added by users

-- SIP Investments data will be added by users

-- Provident Fund data will be added by users

-- Insurance Policies data will be added by users
"

echo "Migration complete. Master data has been loaded."
