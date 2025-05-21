-- Clear any existing admin-related data
DELETE FROM user_settings WHERE user_id = 'user-001';
DELETE FROM app_users WHERE id = 'user-001';
DELETE FROM app_users WHERE email = 'thanki.kaushik@gmail.com';

-- Add the admin user
INSERT INTO app_users (id, email, password_hash, name, role, is_active, created_at, updated_at)
VALUES
  ('user-001', 'thanki.kaushik@gmail.com', '$2a$10$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', 'Kaushik Thanki', 'admin', true, NOW(), NOW());

-- Add the user settings
INSERT INTO user_settings (id, user_id, stock_price_alert_threshold, app_name, stock_api_key, created_at, updated_at)
VALUES
  ('settings-001', 'user-001', 5.0, 'Money Flow Guardian', 'LR78N65XUDF2EZDB', NOW(), NOW());

-- Verify admin user creation
SELECT * FROM app_users WHERE id = 'user-001';
SELECT * FROM user_settings WHERE user_id = 'user-001';
