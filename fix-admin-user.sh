#!/bin/bash

# Execute the SQL file to fix the admin user
docker-compose exec db psql -U postgres -d financeapp -f /fix-admin-user.sql

# Restart the API container to pick up the changes
docker-compose restart api
