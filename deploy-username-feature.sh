#!/bin/bash

echo "🚀 Deploying Username Profile URL Feature"
echo "=========================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes. Committing..."
    
    # Add all changes
    git add .
    
    # Commit with descriptive message
    git commit -m "Add username-based profile URLs (LinkedIn-style)

- Added username property to User type in AuthContext
- Updated all profile navigation links to use /in/[username] format
- Added Link import to dashboard page
- Implemented fallback to /profile for users without username
- Ready for username migration"
    
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎉 Deployment initiated!"
    echo ""
    echo "Next steps:"
    echo "1. Wait for Vercel to deploy (check: https://vercel.com/dashboard)"
    echo "2. Generate username by visiting: https://pro-net-ten.vercel.app/profile"
    echo "3. Click the 'Generate Username' button"
    echo "4. You'll be redirected to /in/[your-username]"
    echo ""
    echo "Or run the migration endpoint to generate usernames for all users:"
    echo "curl -X POST https://your-backend-api.com/users/migrate-usernames"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
