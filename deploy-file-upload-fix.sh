#!/bin/bash

echo "🚀 Deploying File Upload Fix"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -d "services/api-gateway" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📝 Step 1: Checking git status..."
git status --short

echo ""
echo "📦 Step 2: Adding changes..."
git add services/api-gateway/
git add services/user-service/src/upload/
git add services/user-service/src/main.ts
git add FIX_API_GATEWAY_FILE_UPLOAD.md
git add *.md

echo ""
echo "💾 Step 3: Committing changes..."
git commit -m "Fix: Add complete file upload support through API gateway

- Added Multer to API gateway for parsing multipart/form-data
- Added form-data package for re-encoding files when forwarding
- Updated proxy controller to handle file uploads separately
- Updated proxy service to detect and forward multipart requests
- Increased body size limits in both gateway and user-service
- Added proper error handling and logging

Fixes #issue-500-file-upload"

if [ $? -ne 0 ]; then
    echo "⚠️  Nothing to commit or commit failed"
    echo "   Checking if changes are already committed..."
fi

echo ""
echo "🌐 Step 4: Pushing to remote..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Wait for automatic deployment (2-5 minutes)"
    echo "   2. Check Render dashboard for deployment status"
    echo "   3. Check Vercel dashboard for frontend deployment"
    echo "   4. Test file upload on production URL"
    echo ""
    echo "🔍 Monitor deployment:"
    echo "   Render: https://dashboard.render.com"
    echo "   Vercel: https://vercel.com/dashboard"
    echo ""
    echo "📊 Check logs after deployment:"
    echo "   docker-compose logs -f api-gateway"
    echo "   docker-compose logs -f user-service"
else
    echo ""
    echo "❌ Failed to push to remote"
    echo "   Please check your git configuration and try again"
    exit 1
fi
