
#!/bin/bash

# Make the script executable
chmod +x "${0}"

echo "Stopping Money Flow Guardian Application..."

# Stop the containers
docker-compose down

if [ $? -ne 0 ]; then
    echo "Failed to stop containers. Please check the error message above."
    exit 1
fi

echo
echo "Application has been stopped successfully."
