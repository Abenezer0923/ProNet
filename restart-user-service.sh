#!/bin/bash

# Script to restart the user service and apply schema changes
# Usage: ./restart-user-service.sh

echo "Restarting User Service"
echo "======================="
echo ""

# Check if running in Docker
if [ -f "docker-compose.yml" ]; then
    echo "Detected Docker Compose setup"
    echo "Restarting user-service container..."
    docker-compose restart user-service
    
    echo ""
    echo "Waiting for service to start..."
    sleep 5
    
    echo ""
    echo "Checking service logs:"
    docker-compose logs --tail=50 user-service
else
    echo "No Docker Compose detected"
    echo "Please restart your user-service manually:"
    echo ""
    echo "  cd services/user-service"
    echo "  npm run start:dev"
    echo ""
    echo "Or if using PM2:"
    echo "  pm2 restart user-service"
fi

echo ""
echo "After restart, the database schema should be automatically updated"
echo "due to synchronize: true in TypeORM configuration."
