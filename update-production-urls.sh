#!/bin/bash

# Script to help update production URLs after deployment
# Run this after deploying to Vercel and Render

echo "🚀 ProNet Production URL Configuration Helper"
echo "=============================================="
echo ""

# Get Vercel URL
echo "📝 Step 1: Enter your Vercel frontend URL"
echo "Example: https://pronet-app.vercel.app"
read -p "Vercel URL: " VERCEL_URL

# Get Render User Service URL
echo ""
echo "📝 Step 2: Enter your Render User Service URL"
echo "Example: https://pronet-user-service.onrender.com"
read -p "Render User Service URL: " RENDER_USER_URL

# Get Render API Gateway URL
echo ""
echo "📝 Step 3: Enter your Render API Gateway URL"
echo "Example: https://pronet-api-gateway.onrender.com"
read -p "Render API Gateway URL: " RENDER_API_URL

echo ""
echo "=============================================="
echo "✅ Configuration Summary"
echo "=============================================="
echo ""

# Display Google Console Configuration
echo "📋 GOOGLE CLOUD CONSOLE CONFIGURATION"
echo "--------------------------------------"
echo ""
echo "Go to: https://console.cloud.google.com/"
echo "Navigate to: APIs & Services > Credentials > OAuth 2.0 Client ID"
echo ""
echo "Add these Authorized Redirect URIs:"
echo "  ✓ http://localhost:3001/api/auth/google/callback"
echo "  ✓ ${RENDER_USER_URL}/api/auth/google/callback"
echo ""
echo "Add these Authorized JavaScript Origins:"
echo "  ✓ http://localhost:3000"
echo "  ✓ ${VERCEL_URL}"
echo ""

# Display Render Configuration
echo "=============================================="
echo "📋 RENDER CONFIGURATION"
echo "--------------------------------------"
echo ""
echo "Go to: https://dashboard.render.com"
echo "Click on: pronet-user-service > Environment"
echo ""
echo "Update these environment variables:"
echo "  GOOGLE_CALLBACK_URL=${RENDER_USER_URL}/api/auth/google/callback"
echo "  FRONTEND_URL=${VERCEL_URL}"
echo ""

# Display Vercel Configuration
echo "=============================================="
echo "📋 VERCEL CONFIGURATION"
echo "--------------------------------------"
echo ""
echo "Go to: https://vercel.com/dashboard"
echo "Click on your project > Settings > Environment Variables"
echo ""
echo "Add/Update these environment variables:"
echo "  NEXT_PUBLIC_API_URL=${RENDER_API_URL}"
echo "  NEXT_PUBLIC_WS_URL=${RENDER_USER_URL}"
echo ""

# Create a reference file
echo "=============================================="
echo "📄 Creating reference file..."
echo "=============================================="

cat > PRODUCTION_URLS.txt << EOF
ProNet Production URLs Configuration
Generated: $(date)

===========================================
FRONTEND (Vercel)
===========================================
URL: ${VERCEL_URL}

Environment Variables:
  NEXT_PUBLIC_API_URL=${RENDER_API_URL}
  NEXT_PUBLIC_WS_URL=${RENDER_USER_URL}

===========================================
BACKEND (Render)
===========================================
User Service URL: ${RENDER_USER_URL}
API Gateway URL: ${RENDER_API_URL}

User Service Environment Variables:
  GOOGLE_CLIENT_ID=1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=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
  GOOGLE_CALLBACK_URL=${RENDER_USER_URL}/api/auth/google/callback
  FRONTEND_URL=${VERCEL_URL}

===========================================
GOOGLE CLOUD CONSOLE
===========================================
Authorized Redirect URIs:
  - http://localhost:3001/api/auth/google/callback
  - ${RENDER_USER_URL}/api/auth/google/callback

Authorized JavaScript Origins:
  - http://localhost:3000
  - ${VERCEL_URL}

===========================================
TESTING
===========================================
1. Visit: ${VERCEL_URL}
2. Click "Continue with Google"
3. Authorize the app
4. Should redirect back and login successfully

===========================================
TROUBLESHOOTING
===========================================
If OAuth doesn't work:
1. Verify all URLs match exactly (no typos)
2. Check Google Console has correct redirect URIs
3. Verify Render environment variables are saved
4. Check Render logs for errors
5. Wait 30-60 seconds for Render to wake up (free tier)

===========================================
USEFUL COMMANDS
===========================================
# Check if services are running
curl ${RENDER_API_URL}/health
curl ${RENDER_USER_URL}/health

# View Render logs
# Go to: https://dashboard.render.com
# Click on service > Logs

# Redeploy Vercel
cd frontend && vercel --prod

# Redeploy Render
# Push to GitHub main branch (auto-deploys)
EOF

echo ""
echo "✅ Reference file created: PRODUCTION_URLS.txt"
echo ""
echo "=============================================="
echo "🎉 Next Steps"
echo "=============================================="
echo ""
echo "1. Update Google Cloud Console (copy URLs above)"
echo "2. Update Render environment variables"
echo "3. Update Vercel environment variables"
echo "4. Wait for services to redeploy"
echo "5. Test OAuth flow at: ${VERCEL_URL}"
echo ""
echo "📄 All configuration saved to: PRODUCTION_URLS.txt"
echo ""
echo "Good luck! 🚀"
