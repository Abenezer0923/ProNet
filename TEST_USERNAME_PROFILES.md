# Testing Username-Based Profile URLs

## Quick Test Guide

### 1. Check Your Current Profile
```bash
# Visit your profile
https://pro-net-ten.vercel.app/profile
```

**Expected Behavior:**
- If you have a username: Automatically redirects to `/in/[your-username]`
- If you don't have a username: Shows yellow banner with "Generate Username" button

### 2. Generate Username (if needed)
1. Click the "Generate Username" button on the yellow banner
2. System generates a unique username based on your name
3. Page automatically refreshes and redirects to `/in/[your-username]`

### 3. Test Navigation Links
Visit these pages and click profile links:

#### Dashboard (`/dashboard`)
- Click your name in the header → Should go to `/in/[username]`
- Click "View Profile" card → Should go to `/in/[username]`
- Click "View Profile" in Quick Actions → Should go to `/in/[username]`

#### Connections Page (`/connections`)
- Click "Back to Profile" → Should go to `/in/[username]`

#### Profile Edit Page (`/profile/edit`)
- Click "Cancel" button → Should go to `/in/[username]`
- After saving changes → Should redirect to `/in/[username]`
- Click "View Profile" in header → Should go to `/in/[username]`

#### Other User's Profile (`/profile/[id]`)
- Click "My Profile" → Should go to `/in/[username]`

### 4. Test Profile Sharing
1. Copy your profile URL: `https://pro-net-ten.vercel.app/in/[your-username]`
2. Open in incognito/private window (or share with a friend)
3. Verify the profile loads correctly
4. Check that all information displays properly

### 5. Test Username Format
Usernames are generated as:
- Format: `firstname-lastname-userid`
- Example: `john-doe-123`
- All lowercase
- Spaces replaced with hyphens
- Special characters removed

### 6. Verify Backend Endpoints
Test these API endpoints:

```bash
# Get profile by username
GET /users/in/john-doe-123

# Check username availability
GET /users/username/john-doe-123/available

# Update username (requires auth)
PATCH /users/username
Body: { "username": "new-username" }

# Migrate usernames for all users (admin)
POST /users/migrate-usernames
```

## Common Issues & Solutions

### Issue: Profile link goes to `/profile` instead of `/in/[username]`
**Solution:** User doesn't have a username yet. Click "Generate Username" button.

### Issue: "Username not found" error
**Solution:** 
1. Check if username exists in database
2. Run migration: `POST /users/migrate-usernames`
3. Verify username format (lowercase, no special chars)

### Issue: Old `/profile` route not working
**Solution:** This is expected. The `/profile` route now redirects to username-based URL.

### Issue: Can't access other user's profile
**Solution:** Use `/profile/[userId]` for ID-based access, or `/in/[username]` for username-based access.

## Testing Checklist

- [ ] Visit `/profile` - redirects to `/in/[username]`
- [ ] Generate username if needed
- [ ] All navigation links use username URL
- [ ] Profile sharing works with username URL
- [ ] Edit profile redirects to username URL after save
- [ ] Other users can view your profile via username URL
- [ ] Username format is correct (lowercase, hyphens)
- [ ] No broken links or 404 errors

## Expected URLs

### Before (Old)
- ❌ `https://pro-net-ten.vercel.app/profile`
- ❌ `https://pro-net-ten.vercel.app/profile/uuid-123-456`

### After (New)
- ✅ `https://pro-net-ten.vercel.app/in/john-doe-123`
- ✅ `https://pro-net-ten.vercel.app/in/jane-smith-456`
- ✅ `https://pro-net-ten.vercel.app/in/abenezer0923`

## Migration Steps for Production

1. **Backup Database**
   ```bash
   # Create backup before migration
   pg_dump your_database > backup.sql
   ```

2. **Run Migration**
   ```bash
   # Generate usernames for all existing users
   curl -X POST https://your-api.com/users/migrate-usernames \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Verify Migration**
   ```bash
   # Check that all users have usernames
   SELECT COUNT(*) FROM users WHERE username IS NULL;
   # Should return 0
   ```

4. **Update Frontend**
   ```bash
   # Deploy updated frontend with username-based links
   npm run build
   vercel --prod
   ```

5. **Test Production**
   - Visit production site
   - Test all profile links
   - Verify redirects work
   - Check that sharing works

## Rollback Plan

If issues occur:

1. **Revert Frontend**
   ```bash
   # Rollback to previous deployment
   vercel rollback
   ```

2. **Keep Backend Changes**
   - Username system is backward compatible
   - Old `/profile` route still works
   - No data loss

3. **Fix Issues**
   - Identify and fix specific problems
   - Test in staging environment
   - Redeploy when ready

## Success Criteria

✅ All users have unique usernames
✅ Profile URLs use `/in/[username]` format
✅ All navigation links updated
✅ Profile sharing works correctly
✅ No broken links or 404 errors
✅ Backward compatibility maintained
✅ SEO-friendly URLs
✅ Professional, shareable links

## Next Steps

After successful testing:

1. **Monitor Analytics**
   - Track profile views
   - Monitor 404 errors
   - Check user engagement

2. **Gather Feedback**
   - Ask users about new URLs
   - Check for usability issues
   - Collect improvement suggestions

3. **Optional Enhancements**
   - Custom username selection
   - Username validation UI
   - Social media integration
   - Open Graph meta tags

## Support

If you encounter issues:
1. Check this guide first
2. Review USERNAME_PROFILE_URL_UPDATE.md
3. Check backend logs for errors
4. Verify database has username column
5. Test API endpoints directly
