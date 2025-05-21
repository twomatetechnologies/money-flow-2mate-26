#!/bin/bash

echo "========== TESTING MONEY FLOW GUARDIAN ADMIN LOGIN =========="
echo "Testing with admin credentials:"
echo "  Email: thanki.kaushik@gmail.com"
echo "  Password: password123"
echo ""

# Stop existing containers
echo "Stopping all containers..."
docker-compose down

# ========== PART 1: TESTING WITH POSTGRES MODE ==========
echo -e "\n========== TESTING WITH POSTGRES MODE ==========\n"

# Start the database
echo "Starting database..."
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 8

# Apply admin user fix directly with SQL commands
echo "Setting up admin user in PostgreSQL..."
docker-compose -f docker-compose.db.yml exec db psql -U postgres -d financeapp -c "
  -- Remove any existing admin user
  DELETE FROM user_settings WHERE user_id = 'user-001';
  DELETE FROM app_users WHERE id = 'user-001';
  DELETE FROM app_users WHERE email = 'thanki.kaushik@gmail.com';
  
  -- Insert the admin user with correct password hash for 'password123'
  INSERT INTO app_users (id, email, password_hash, name, role, is_active, created_at, updated_at)
  VALUES ('user-001', 'thanki.kaushik@gmail.com', '\$2a\$10\$dPzE4X4FHDYgWWhVzrZAO.f8ZimRWOkr31b/fbwYhh52w2kJ1H5TG', 'Kaushik Thanki', 'admin', true, NOW(), NOW());
  
  -- Insert user settings
  INSERT INTO user_settings (id, user_id, stock_price_alert_threshold, app_name, stock_api_key, created_at, updated_at)
  VALUES ('settings-001', 'user-001', 5.0, 'Money Flow Guardian', 'LR78N65XUDF2EZDB', NOW(), NOW());
  
  -- Verify admin user was created
  SELECT * FROM app_users WHERE id = 'user-001';
"

# Start the API with PostgreSQL enabled
echo "Starting API with PostgreSQL mode..."
cd /Users/twomate/Developer/Personal/Finance/money-flow-2mate-26
./run-api.sh

echo "Waiting for API to start..."
sleep 5

# Test admin login with PostgreSQL mode
echo "Testing PostgreSQL Mode Login:"
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "thanki.kaushik@gmail.com", "password": "password123"}' | jq || echo "Login attempt failed or jq not installed"

echo -e "\nAPI logs from PostgreSQL mode:"
docker logs money-flow-2mate-26-api-1 2>&1 | grep -i "LOGIN\|USER\|PASSWORD" | tail -n 10

# ========== PART 2: TESTING WITH IN-MEMORY MODE ==========
echo -e "\n========== TESTING WITH IN-MEMORY MODE ==========\n"

# Stop the API container
echo "Stopping API container for in-memory testing..."
docker stop money-flow-2mate-26-api-1 || true

# Start the API with in-memory mode (running locally for better debugging)
echo "Starting API with in-memory mode..."
cd /Users/twomate/Developer/Personal/Finance/money-flow-2mate-26

# Export environment variables for in-memory mode
export NODE_ENV=development
export POSTGRES_ENABLED=false
export API_PORT=8081

# Run the server in the background with debugging
echo "Running local API server with in-memory mode and verbose logging..."
DEBUG_MODE=true node src/api/server.js > api_debug.log 2>&1 &
API_PID=$!

echo "Waiting for API to start..."
sleep 3

# Test admin login with in-memory mode
echo "Testing In-Memory Mode Login:"
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "thanki.kaushik@gmail.com", "password": "password123"}' | jq || echo "Login attempt failed or jq not installed"

echo -e "\nAPI logs from in-memory mode:"
tail -n 20 api_debug.log

# Cleanup
echo -e "\n========== CLEANUP ==========\n"
echo "Stopping local API server (PID: $API_PID)..."
kill $API_PID || true
echo "Done!"
