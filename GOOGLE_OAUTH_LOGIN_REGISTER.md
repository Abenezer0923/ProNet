# Google OAuth on Login & Register Pages

## Overview
Added "Continue with Google" button to both Login and Register pages for seamless OAuth authentication.

## Changes Made

### 1. Login Page (`frontend/src/app/login/page.tsx`)

**Added:**
- Divider with "Or continue with" text
- Google OAuth button with Google logo
- Consistent styling with register page

**Features:**
- Redirects to `/auth/google` endpoint
- Same OAuth flow as landing page
- Shows OTP verification when required
- Maintains existing email/password login

### 2. Register Page (`frontend/src/app/register/page.tsx`)

**Added:**
- Divider with "Or continue with" text
- Google OAuth button with Google logo
- Consistent styling with login page

**Features:**
- Redirects to `/auth/google` endpoint
- Creates new account if user doesn't exist
- Shows OTP verification for new Google users
- Maintains existing registration form

## User Experience

### Login Page Flow
```
┌─────────────────────────────────┐
│ Email: [____________]           │
│ Password: [____________]        │
│ [Sign In]                       │
│                                 │
│ ─── Or continue with ───        │
│                                 │
│ [🔵 Continue with Google]       │
│                                 │
│ Don't have an account? Sign up  │
└─────────────────────────────────┘
```

### Register Page Flow
```
┌─────────────────────────────────┐
│ First Name: [____________]      │
│ Last Name: [____________]       │
│ Email: [____________]           │
│ Profession: [____________]      │
│ Password: [____________]        │
│ [Create Account]                │
│                                 │
│ ─── Or continue with ───        │
│                                 │
│ [🔵 Continue with Google]       │
│                                 │
│ Already have an account? Sign in│
└─────────────────────────────────┘
```

## OAuth Flow

### For Existing Users (Login)
1. Click "Continue with Google"
2. Authenticate with Google
3. Redirected to OTP verification page
4. OTP displayed in yellow banner (demo mode)
5. Enter OTP and verify
6. Redirected to dashboard

### For New Users (Register)
1. Click "Continue with Google"
2. Authenticate with Google
3. Account created automatically
4. Redirected to OTP verification page
5. OTP displayed in yellow banner (demo mode)
6. Enter OTP and verify
7. Redirected to dashboard

## Technical Details

### Button Implementation
```tsx
<button
  onClick={() => {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
    window.location.href = `${authUrl}/auth/google`;
  }}
  className="mt-4 w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google logo SVG paths */}
  </svg>
  <span className="font-semibold text-gray-700">Continue with Google</span>
</button>
```

### Environment Variables
- `NEXT_PUBLIC_AUTH_URL` - Backend auth service URL
- Default: `http://localhost:3001`
- Production: Set to your deployed backend URL

## Styling

### Divider
- Gray border line
- "Or continue with" text centered
- White background for text

### Google Button
- White background
- Gray border (2px)
- Google logo (colored)
- Hover effect (light gray background)
- Shadow for depth
- Full width
- Rounded corners

## Benefits

✅ **Consistent UX** - Same OAuth option on all auth pages
✅ **Faster Sign-up** - One-click registration with Google
✅ **Faster Login** - No need to remember passwords
✅ **Better Conversion** - Reduces friction in auth flow
✅ **Professional Look** - Matches modern web standards
✅ **Mobile Friendly** - Works great on all devices

## Testing

### Test Login with Google
```bash
# 1. Start services
docker-compose up

# 2. Navigate to login page
http://localhost:3001/login

# 3. Click "Continue with Google"
# 4. Complete Google authentication
# 5. Verify OTP (displayed in yellow banner)
# 6. Should redirect to dashboard
```

### Test Register with Google
```bash
# 1. Navigate to register page
http://localhost:3001/register

# 2. Click "Continue with Google"
# 3. Complete Google authentication
# 4. New account created automatically
# 5. Verify OTP (displayed in yellow banner)
# 6. Should redirect to dashboard
```

## Files Modified

1. `frontend/src/app/login/page.tsx` - Added Google OAuth button
2. `frontend/src/app/register/page.tsx` - Added Google OAuth button

## Backend Support

The backend already supports Google OAuth:
- ✅ `/auth/google` - Initiates OAuth flow
- ✅ `/auth/google/callback` - Handles OAuth callback
- ✅ Creates new users automatically
- ✅ Generates OTP for verification
- ✅ Returns OTP in demo mode

## Security Notes

- OAuth flow uses secure HTTPS in production
- State parameter prevents CSRF attacks
- OTP adds extra security layer
- Session management tracks login state
- Tokens are JWT-based and secure

## Future Enhancements

- Add more OAuth providers (GitHub, LinkedIn, etc.)
- Remember device to skip OTP
- Social profile picture import
- Auto-fill profession from Google profile
- Link multiple OAuth accounts

## Troubleshooting

**Q: Google button doesn't work**
- Check `NEXT_PUBLIC_AUTH_URL` environment variable
- Verify backend is running
- Check Google OAuth credentials

**Q: Redirects to wrong URL**
- Update `FRONTEND_URL` in backend `.env`
- Check Google Console authorized redirect URIs

**Q: OTP not showing**
- Check backend logs for OTP generation
- Verify OTP demo mode is enabled
- Check browser console for errors

---

**Now users can sign in with Google from any auth page!** 🎉
