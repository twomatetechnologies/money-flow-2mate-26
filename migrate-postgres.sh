
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
  created_at TIMESTAMP DEFAULT NOW()
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
  value NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * COALESCE(current_price, purchase_price)) STORED
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
INSERT INTO family_members (id, name, relationship, date_of_birth, color, is_active)
VALUES
  ('fam-001', 'John Smith', 'Self', '1985-04-15', '#4f46e5', true),
  ('fam-002', 'Jane Smith', 'Spouse', '1987-09-22', '#ec4899', true),
  ('fam-003', 'Emma Smith', 'Daughter', '2015-06-10', '#14b8a6', true),
  ('fam-004', 'Michael Smith', 'Son', '2018-01-05', '#f97316', true)
ON CONFLICT (id) DO NOTHING;

-- Financial Goal Categories
INSERT INTO financial_goals (id, name, target_amount, current_amount, deadline, category, notes, priority, family_member_id)
VALUES
  ('goal-001', 'Emergency Fund', 500000, 350000, '2025-12-31', 'Savings', 'Six months of expenses', 'High', 'fam-001'),
  ('goal-002', 'Retirement Fund', 10000000, 2500000, '2045-04-15', 'Retirement', 'Retirement corpus target', 'Medium', 'fam-001'),
  ('goal-003', 'Emma''s Education', 5000000, 1000000, '2032-06-01', 'Education', 'College education fund', 'High', 'fam-003')
ON CONFLICT (id) DO NOTHING;

-- Add Sample Users
INSERT INTO app_users (id, email, password_hash, name, role, is_active)
VALUES
  ('user-001', 'user@example.com', '\$2a\$10\$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', 'Demo User', 'user', true),
  ('user-002', 'admin@example.com', '\$2a\$10\$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', 'Admin User', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- Add Default User Settings
INSERT INTO user_settings (id, user_id, stock_price_alert_threshold, app_name, stock_api_key)
VALUES
  ('settings-001', 'user-001', 5.0, 'Money Flow Guardian', 'LR78N65XUDF2EZDB'),
  ('settings-002', 'user-002', 10.0, 'Financial Portfolio Tracker', 'LR78N65XUDF2EZDB')
ON CONFLICT (id) DO UPDATE SET
  stock_price_alert_threshold = EXCLUDED.stock_price_alert_threshold,
  app_name = EXCLUDED.app_name,
  stock_api_key = EXCLUDED.stock_api_key;

-- Add Sample Stocks
INSERT INTO stocks (id, symbol, company_name, quantity, purchase_price, purchase_date, current_price, sector, family_member_id, notes, last_updated)
VALUES
  ('stock-001', 'RELIANCE', 'Reliance Industries Ltd', 10, 2500.50, '2023-05-15', 2750.25, 'Energy', 'fam-001', 'Long term investment', NOW()),
  ('stock-002', 'HDFCBANK', 'HDFC Bank Limited', 15, 1650.75, '2023-06-20', 1750.50, 'Banking', 'fam-002', 'Dividend stock', NOW()),
  ('stock-003', 'TCS', 'Tata Consultancy Services', 8, 3450.00, '2023-07-10', 3400.75, 'Technology', 'fam-001', 'IT sector leader', NOW()),
  ('stock-004', 'INFY', 'Infosys Limited', 20, 1580.25, '2023-08-05', 1620.00, 'Technology', 'fam-003', 'Growth potential', NOW())
ON CONFLICT (id) DO NOTHING;

-- ... keep existing code (Rest of the master data inserts for Fixed Deposits, Gold, Savings, SIP, PF, Insurance)
-- Add Sample Fixed Deposits
INSERT INTO fixed_deposits (id, bank_name, amount, interest_rate, start_date, maturity_date, term_months, fd_number, is_auto_renewal, family_member_id, notes, principal, maturity_amount, account_number)
VALUES
  ('fd-001', 'HDFC Bank', 100000.00, 7.25, '2024-01-01', '2025-01-01', 12, 'FD123456', false, 'fam-001', 'Annual FD', 100000.00, 107250.00, 'FD789012'),
  ('fd-002', 'SBI', 250000.00, 6.75, '2024-02-15', '2026-02-15', 24, 'FD234567', true, 'fam-002', 'Two year deposit', 250000.00, 283781.25, 'FD890123'),
  ('fd-003', 'ICICI Bank', 75000.00, 7.00, '2024-03-10', '2024-09-10', 6, 'FD345678', false, 'fam-001', 'Short term FD', 75000.00, 78625.00, 'FD901234')
ON CONFLICT (id) DO NOTHING;

-- Add Sample Gold Investments
INSERT INTO gold_investments (id, type, quantity, purchase_date, purchase_price, current_price, value, location, notes, family_member_id)
VALUES
  ('gold-001', 'Physical', 20.00, '2023-10-12', 5600.00, 6200.00, 124000.00, 'Bank Locker', '22K Gold Coins', 'fam-001'),
  ('gold-002', 'Digital', 15.00, '2023-12-05', 5750.00, 6200.00, 93000.00, 'Gold ETF', 'Sovereign Gold Bond', 'fam-002'),
  ('gold-003', 'Physical', 10.00, '2024-01-18', 5900.00, 6200.00, 62000.00, 'Home Safe', 'Gold Bars', 'fam-003')
ON CONFLICT (id) DO NOTHING;

-- Add Sample Savings Accounts
INSERT INTO savings_accounts (id, bank_name, account_number, account_type, balance, interest_rate, branch_name, ifsc_code, family_member_id, notes)
VALUES
  ('sa-001', 'HDFC Bank', 'SA123456789', 'Savings', 75000.00, 3.50, 'Andheri Branch', 'HDFC0001234', 'fam-001', 'Primary account'),
  ('sa-002', 'ICICI Bank', 'SA234567890', 'Salary', 45000.00, 3.25, 'Bandra Branch', 'ICIC0005678', 'fam-002', 'Salary account'),
  ('sa-003', 'SBI', 'SA345678901', 'Savings', 30000.00, 2.75, 'Juhu Branch', 'SBIN0009012', 'fam-001', 'Secondary account')
ON CONFLICT (id) DO NOTHING;

-- Add Sample SIP Investments
INSERT INTO sip_investments (id, name, amount, frequency, start_date, fund_type, units, current_nav, family_member_id, notes, current_value, returns, returns_percent, type)
VALUES
  ('sip-001', 'Axis Bluechip Fund', 5000.00, 'Monthly', '2023-01-15', 'Equity', 150.25, 42.50, 'fam-001', 'Large Cap Fund', 6385.63, 1385.63, 8.50, 'Mutual Fund'),
  ('sip-002', 'HDFC Mid-Cap Opportunities', 3000.00, 'Monthly', '2023-03-10', 'Equity', 85.75, 38.20, 'fam-002', 'Mid Cap Fund', 3275.65, 275.65, 5.25, 'Mutual Fund'),
  ('sip-003', 'SBI Debt Fund', 2500.00, 'Quarterly', '2023-04-20', 'Debt', 95.50, 28.75, 'fam-001', 'Conservative Investment', 2746.63, 246.63, 4.75, 'Debt Fund')
ON CONFLICT (id) DO NOTHING;

-- Add Sample Provident Fund Entries
INSERT INTO provident_fund (id, account_number, employee_contribution, employer_contribution, total_balance, interest_rate, start_date, family_member_id, notes, employer_name, monthly_contribution)
VALUES
  ('pf-001', 'PF12345678', 125000.00, 125000.00, 260000.00, 8.15, '2020-04-01', 'fam-001', 'EPF Account', 'ABC Corporation', 5000.00),
  ('pf-002', 'PF23456789', 85000.00, 85000.00, 180000.00, 8.15, '2021-07-01', 'fam-002', 'EPF Account', 'XYZ Ltd', 3500.00)
ON CONFLICT (id) DO NOTHING;

-- Add Sample Insurance Policies
INSERT INTO insurance_policies (id, type, policy_number, provider, cover_amount, premium, frequency, start_date, end_date, family_member_id, notes)
VALUES
  ('ins-001', 'Life', 'LP123456789', 'LIC of India', 5000000.00, 25000.00, 'Annual', '2022-05-10', '2042-05-09', 'fam-001', 'Term Insurance'),
  ('ins-002', 'Health', 'HP234567890', 'Star Health', 500000.00, 15000.00, 'Annual', '2023-08-15', '2024-08-14', 'fam-001', 'Family Floater'),
  ('ins-003', 'Vehicle', 'VP345678901', 'ICICI Lombard', 800000.00, 12000.00, 'Annual', '2024-01-10', '2025-01-09', 'fam-002', 'Car Insurance')
ON CONFLICT (id) DO NOTHING;
"

echo "Migration complete. Master data has been loaded."

