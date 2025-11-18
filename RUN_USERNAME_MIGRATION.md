# Username Migration Guide

## ⚠️ IMPORTANT: Run After Deployment

After the latest changes deploy to production, you need to run the migration endpoint ONCE to generate usernames for existing users.

## How to Run Migration

### Option 1: Using curl (Recommended)
```bash
curl -X POST https://pronet-api-gateway.onrender.com/users/migrate-usernames \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 2: Using Postman/Insomnia
1. Create a POST request
2. URL: `https://pronet-api-gateway.onrender.com/users/migrate-usernames`
3. Add Header: `Authorization: Bearer YOUR_TOKEN`
4. Send request

### Option 3: Using Browser Console
```javascript
fetch('https://pronet-api-gateway.onrender.com/users/migrate-usernames', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

## Expected Response

```json
{
  "message": "Username migration complete",
  "migrated": 5,
  "skipped": 0,
  "total": 5
}
```

- **migrated**: Number of users that got new usernames
- **skipped**: Users that already had usernames
- **total**: Total users in database

## What It Does

1. Finds all users without usernames
2. Generates username from their first/last name
3. Ensures uniqueness
4. Saves to database

## After Migration

✅ All users will have usernames
✅ New registrations automatically get usernames
✅ Users can update their usernames in settings (coming soon)
✅ Profile URLs will work: `/in/{username}`

## Troubleshooting

### Error: "Unauthorized"
- Make sure you're logged in
- Get a fresh token from localStorage
- Use an admin account if available

### Error: "Username already exists"
- This shouldn't happen (migration handles duplicates)
- If it does, run migration again (it's idempotent)

### Some users still don't have usernames
- Check the response to see how many were skipped
- Run migration again
- Check backend logs for errors

## Verification

After running migration, check a few users:

```bash
# Check by username
curl https://pronet-api-gateway.onrender.com/users/in/john-doe

# Check your profile
curl https://pronet-api-gateway.onrender.com/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You should see `username` field in the response.

## Next Steps

After migration is complete:
1. ✅ Test username endpoints
2. ✅ Implement frontend username display
3. ✅ Add username to profile URLs
4. ✅ Add username edit in settings

---

**Status:** Ready to run after deployment
**Run Once:** Yes (idempotent, safe to run multiple times)
**Required:** Yes (for existing users)
