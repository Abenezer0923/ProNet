#!/bin/bash

# Fix Git email addresses in history using git filter-branch
# This will rewrite all commits from abenezer@example.com to abenezergetachew1990@gmail.com

echo "⚠️  WARNING: This will rewrite Git history!"
echo "📧 Changing: abenezer@example.com → abenezergetachew1990@gmail.com"
echo ""
read -p "Continue? (yes/no): " confirm

# Convert to lowercase
confirm=$(echo "$confirm" | tr '[:upper:]' '[:lower:]')

if [ "$confirm" != "yes" ] && [ "$confirm" != "y" ]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "🔄 Creating backup branch..."
git branch backup-before-email-fix 2>/dev/null || echo "Backup branch already exists"

echo "🔧 Rewriting Git history..."
git filter-branch --env-filter '
OLD_EMAIL="abenezer@example.com"
CORRECT_EMAIL="abenezergetachew1990@gmail.com"
CORRECT_NAME="Abenezer"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

echo ""
echo "✅ Email addresses updated!"
echo ""
echo "📊 Verifying changes..."
git log --pretty=format:'%an <%ae>' | head -n 5

echo ""
echo ""
echo "🚀 Next steps:"
echo "1. Review the changes above"
echo "2. Force push to GitHub: git push origin main --force"
echo "3. If something goes wrong, restore: git reset --hard backup-before-email-fix"
echo ""
echo "⚠️  Note: After force push, GitHub contributions should appear within 24 hours"
