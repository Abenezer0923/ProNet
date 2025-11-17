# Quick OTP Demo Guide

## What Changed?

The OTP code is now **displayed directly on the verification page** for demo purposes.

## How to Use

### 1. Google Sign In
- Click "Sign in with Google"
- Complete Google authentication
- **Look for the yellow banner** on the OTP page
- The OTP code will be displayed like this:

```
┌─────────────────────────────┐
│ Demo Mode - Your OTP:       │
│ 123456                      │
└─────────────────────────────┘
```

### 2. Enter the OTP
- Copy the code from the yellow banner
- Enter it in the 6 input boxes
- Click "Verify Email"

### 3. Resend OTP (if needed)
- Click "Resend OTP" button
- A new code will be generated
- The yellow banner will update with the new code

## Where to Find OTP

1. **On the verification page** - Yellow banner (primary method)
2. **In backend console** - Look for `📧 OTP for email@example.com: 123456`
3. **In email** - If email service is configured (backup method)

## Quick Test

```bash
# 1. Start services
docker-compose up

# 2. Open browser
http://localhost:3001

# 3. Click "Sign in with Google"

# 4. After Google auth, you'll see the OTP page with code displayed

# 5. Enter the code and verify
```

## Console Check

```bash
# View backend logs
docker-compose logs -f user-service | grep OTP

# You'll see:
# 📧 OTP for user@example.com: 123456
# ⏰ OTP expires at: 2025-11-17T10:30:00.000Z
```

## Important Notes

- ✅ OTP is displayed for **10 minutes** before expiring
- ✅ Each resend generates a **new code**
- ✅ Old codes are **invalidated** when new ones are generated
- ⚠️ This is **demo mode only** - remove for production

## Production Deployment

When deploying to production:
1. Configure email service properly
2. Remove OTP from API responses (in auth.service.ts and auth.controller.ts)
3. Remove yellow banner from frontend (in verify-otp/page.tsx)
4. Test email delivery thoroughly

## Troubleshooting

**Q: I don't see the yellow banner**
- Check if you're being redirected from Google OAuth
- Check browser console for errors
- Verify the URL has `?otp=123456` parameter

**Q: OTP says "Invalid or expired"**
- Check if 10 minutes have passed
- Try clicking "Resend OTP"
- Check backend console for the current valid OTP

**Q: Resend doesn't show new OTP**
- Check browser console for API errors
- Verify backend is running
- Check backend logs for OTP generation

## Files Modified

- `services/user-service/src/auth/auth.service.ts` - Returns OTP code
- `services/user-service/src/auth/auth.controller.ts` - Includes OTP in responses
- `frontend/src/app/verify-otp/page.tsx` - Displays OTP banner

---

**That's it!** The OTP is now visible for easy demo and testing. 🎉
