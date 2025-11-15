#!/bin/bash

# Script to temporarily rename Dockerfiles for Render deployment
# This prevents Render from trying to use Docker build

echo "🔧 Renaming Dockerfiles for Render deployment..."

# Rename Dockerfiles
if [ -f "services/user-service/Dockerfile" ]; then
    mv services/user-service/Dockerfile services/user-service/Dockerfile.local
    echo "✅ Renamed services/user-service/Dockerfile"
fi

if [ -f "services/api-gateway/Dockerfile" ]; then
    mv services/api-gateway/Dockerfile services/api-gateway/Dockerfile.local
    echo "✅ Renamed services/api-gateway/Dockerfile"
fi

if [ -f "frontend/Dockerfile" ]; then
    mv frontend/Dockerfile frontend/Dockerfile.local
    echo "✅ Renamed frontend/Dockerfile"
fi

echo ""
echo "📝 Dockerfiles renamed to .local extension"
echo "🚀 Now commit and push to trigger Render deployment"
echo ""
echo "Commands:"
echo "  git add ."
echo "  git commit -m 'temp: Rename Dockerfiles for Render deployment'"
echo "  git push origin main"
echo ""
echo "⚠️  After deployment succeeds, run: ./restore-dockerfiles.sh"
