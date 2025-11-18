#!/bin/bash

echo "🔍 Checking Deployment Status"
echo "=============================="
echo ""

# Check if changes are committed
echo "📝 Checking Git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes!"
    echo "   Run: git add . && git commit -m 'your message' && git push"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📤 Checking last 3 commits..."
git log --oneline -3

echo ""
echo "🌐 Next Steps:"
echo ""
echo "1. Hard refresh your browser:"
echo "   - Windows/Linux: Ctrl + Shift + R"
echo "   - Mac: Cmd + Shift + R"
echo ""
echo "2. Check Vercel deployment:"
echo "   - Visit: https://vercel.com/dashboard"
echo "   - Look for latest deployment"
echo "   - Wait for 'Ready' status"
echo ""
echo "3. Visit your profile:"
echo "   - Go to: https://pro-net-ten.vercel.app/profile"
echo "   - Look for yellow 'Generate Username' banner"
echo "   - Click the button to create your username"
echo ""
echo "4. After generating username:"
echo "   - You'll be redirected to: /in/[your-username]"
echo "   - All profile links will use this new URL"
echo ""
echo "💡 Tip: If you don't see changes, try:"
echo "   - Open in incognito/private mode"
echo "   - Clear browser cache"
echo "   - Wait 1-2 minutes for Vercel to deploy"
