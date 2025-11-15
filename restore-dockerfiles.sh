#!/bin/bash

# Script to restore Dockerfiles after Render deployment

echo "🔧 Restoring Dockerfiles..."

# Restore Dockerfiles
if [ -f "services/user-service/Dockerfile.local" ]; then
    mv services/user-service/Dockerfile.local services/user-service/Dockerfile
    echo "✅ Restored services/user-service/Dockerfile"
fi

if [ -f "services/api-gateway/Dockerfile.local" ]; then
    mv services/api-gateway/Dockerfile.local services/api-gateway/Dockerfile
    echo "✅ Restored services/api-gateway/Dockerfile"
fi

if [ -f "frontend/Dockerfile.local" ]; then
    mv frontend/Dockerfile.local frontend/Dockerfile
    echo "✅ Restored frontend/Dockerfile"
fi

echo ""
echo "📝 Dockerfiles restored"
echo "🚀 Now commit and push"
echo ""
echo "Commands:"
echo "  git add ."
echo "  git commit -m 'chore: Restore Dockerfiles'"
echo "  git push origin main"
