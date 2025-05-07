
#!/bin/sh
set -e

# Create symbolic link for localStorage persistence
mkdir -p /data/localStorage
chmod 755 /data/localStorage

# Run migrations if using PostgreSQL
if [ "$POSTGRES_ENABLED" = "true" ]; then
  echo "PostgreSQL is enabled, checking database connection..."
  
  # Wait for PostgreSQL to be ready
  MAX_RETRIES=30
  RETRY_COUNT=0
  
  until PGPASSWORD=${POSTGRES_PASSWORD:-postgres123} psql -h ${POSTGRES_HOST:-db} -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-financeapp} -c "SELECT 1" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo "Error: Failed to connect to PostgreSQL after $MAX_RETRIES attempts."
      exit 1
    fi
    echo "Waiting for PostgreSQL to start... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  done
  
  echo "PostgreSQL is up and running. Running migrations..."
  ./migrate-postgres.sh
else
  echo "PostgreSQL is disabled. Running in localStorage-only mode."
fi

# Set up the container is initialized message
echo "Container initialized successfully with data persistence"
echo "Application is accessible at http://localhost:8080"
