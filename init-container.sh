
#!/bin/sh
set -e

# Install PostgreSQL client tools if not already available
if ! command -v psql > /dev/null 2>&1; then
  echo "Installing PostgreSQL client tools..."
  apk --no-cache add postgresql-client
fi

# Create symbolic link for localStorage persistence
mkdir -p /data/localStorage
chmod 755 /data/localStorage

# Create a JS file with environment variables that can be loaded by the frontend
echo "window.POSTGRES_ENABLED = ${POSTGRES_ENABLED:-true};" > /usr/share/nginx/html/env-config.js
echo "Environment configuration generated with POSTGRES_ENABLED=${POSTGRES_ENABLED:-true}"

# Run migrations if using PostgreSQL
if [ "$POSTGRES_ENABLED" = "true" ]; then
  echo "PostgreSQL is enabled, checking database connection..."
  
  # Wait for PostgreSQL to be ready
  MAX_RETRIES=60
  RETRY_COUNT=0
  RETRY_INTERVAL=5
  
  until PGPASSWORD=${POSTGRES_PASSWORD:-postgres123} psql -h ${POSTGRES_HOST:-db} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-financeapp} -c "SELECT 1" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo "Error: Failed to connect to PostgreSQL after $MAX_RETRIES attempts."
      echo "window.DB_CONNECTION_ERROR = true;" >> /usr/share/nginx/html/env-config.js
      exit 1
    fi
    echo "Waiting for PostgreSQL to start... ($RETRY_COUNT/$MAX_RETRIES) - retrying in ${RETRY_INTERVAL} seconds"
    sleep $RETRY_INTERVAL
  done
  
  echo "PostgreSQL is up and running. Running migrations..."
  ./migrate-postgres.sh
  
  # Get database size and store it for the frontend
  DB_SIZE=$(PGPASSWORD=${POSTGRES_PASSWORD:-postgres123} psql -h ${POSTGRES_HOST:-db} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-financeapp} -t -c "SELECT pg_size_pretty(pg_database_size('${POSTGRES_DB:-financeapp}'));" | xargs)
  echo "window.DB_SIZE = \"$DB_SIZE\";" >> /usr/share/nginx/html/env-config.js
  echo "window.DB_CONNECTION_ERROR = false;" >> /usr/share/nginx/html/env-config.js
  echo "Current database size: $DB_SIZE"
else
  echo "PostgreSQL is disabled. Running in localStorage-only mode."
  echo "window.DB_SIZE = \"0 bytes\";" >> /usr/share/nginx/html/env-config.js
  echo "window.DB_CONNECTION_ERROR = false;" >> /usr/share/nginx/html/env-config.js
fi

# Set up the container is initialized message
echo "Container initialized successfully with data persistence"
echo "Application is accessible at http://localhost:8080"
echo "pgAdmin is accessible at http://localhost:5050"
