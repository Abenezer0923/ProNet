#!/bin/bash

# Fix Git email addresses in history
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
git branch backup-before-email-fix

echo "🔧 Rewriting Git history..."
git filter-repo --email-callback '
if commit.author_email == b"abenezer@example.com":
    return b"abenezergetachew1990@gmail.com"
return commit.author_email
' --force

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
echo "3. If something goes wrong, restore: git checkout backup-before-email-fix"
echo ""
echo "⚠️  Note: After force push, GitHub contributions should appear within 24 hours"
