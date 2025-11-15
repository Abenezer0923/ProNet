#!/bin/bash

echo "🔍 Verifying OAuth Setup..."
echo ""

# Check if User Service is responding
echo "1️⃣ Checking User Service health..."
USER_SERVICE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pronet-user-service.onrender.com/health || echo "000")

if [ "$USER_SERVICE_STATUS" = "200" ]; then
    echo "   ✅ User Service is UP (200 OK)"
elif [ "$USER_SERVICE_STATUS" = "000" ]; then
    echo "   ⚠️  User Service is not responding (might be sleeping)"
    echo "   💡 Visit https://pronet-user-service.onrender.com to wake it up"
else
    echo "   ❌ User Service returned: $USER_SERVICE_STATUS"
fi

echo ""

# Check OAuth endpoint
echo "2️⃣ Checking OAuth endpoint..."
OAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L https://pronet-user-service.onrender.com/auth/google || echo "000")

if [ "$OAUTH_STATUS" = "302" ] || [ "$OAUTH_STATUS" = "301" ]; then
    echo "   ✅ OAuth endpoint is working (redirecting to Google)"
elif [ "$OAUTH_STATUS" = "000" ]; then
    echo "   ⚠️  OAuth endpoint not responding (service might be sleeping)"
else
    echo "   ⚠️  OAuth endpoint returned: $OAUTH_STATUS"
fi

echo ""

# Check frontend
echo "3️⃣ Checking Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pro-net-ten.vercel.app || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is UP (200 OK)"
else
    echo "   ❌ Frontend returned: $FRONTEND_STATUS"
fi

echo ""
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$USER_SERVICE_STATUS" = "200" ] && ([ "$OAUTH_STATUS" = "302" ] || [ "$OAUTH_STATUS" = "301" ]) && [ "$FRONTEND_STATUS" = "200" ]; then
    echo "🎉 All systems operational!"
    echo ""
    echo "✅ Next steps:"
    echo "   1. Make sure you added NEXT_PUBLIC_AUTH_URL to Vercel"
    echo "   2. Redeploy your frontend on Vercel"
    echo "   3. Test OAuth at: https://pro-net-ten.vercel.app"
else
    echo "⚠️  Some services need attention:"
    echo ""
    if [ "$USER_SERVICE_STATUS" != "200" ]; then
        echo "   • Wake up User Service: https://pronet-user-service.onrender.com"
        echo "     (Render free tier sleeps after 15 min of inactivity)"
    fi
    if [ "$FRONTEND_STATUS" != "200" ]; then
        echo "   • Check Vercel deployment status"
    fi
fi

echo ""
echo "🔗 Quick Links:"
echo "   • Frontend: https://pro-net-ten.vercel.app"
echo "   • User Service: https://pronet-user-service.onrender.com"
echo "   • Render Dashboard: https://dashboard.render.com"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo ""
