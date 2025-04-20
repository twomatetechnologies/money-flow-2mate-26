
#!/bin/sh
set -e

# Create symbolic link for localStorage persistence
mkdir -p /data/localStorage
chmod 755 /data/localStorage

# Set up the container is initialized message
echo "Container initialized successfully with data persistence"
