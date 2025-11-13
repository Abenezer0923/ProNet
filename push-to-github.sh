#!/bin/bash

echo "🚀 Pushing ProNet to GitHub..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/Abenezer0923/ProNet.git
    echo "✅ Remote added"
else
    echo "✅ Remote already exists"
fi

# Stage all files
echo ""
echo "📝 Staging files..."
git add .

# Commit
echo ""
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Initial commit: ProNet - Professional Community Platform with Authentication"
fi
git commit -m "$commit_msg"

# Push to GitHub
echo ""
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 View your repository:"
echo "   https://github.com/Abenezer0923/ProNet"
echo ""
echo "📋 Next steps:"
echo "   1. Go to your GitHub repository"
echo "   2. Check the Actions tab to see CI/CD workflows"
echo "   3. Create a new branch for development: git checkout -b develop"
echo ""
