
#!/bin/bash

# Make the script executable
chmod +x "${0}"

echo "Starting Money Flow Guardian Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose up --build -d

if [ $? -ne 0 ]; then
    echo "Failed to start containers. Please check the error message above."
    exit 1
fi

echo
echo "Application is starting..."
echo "You can access it at http://localhost:8080"
echo
echo "Press Ctrl+C to view logs or close this window to keep running in background"
echo

# Show logs
docker-compose logs -f
