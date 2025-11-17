# OTP Email Verification for Google OAuth

## Overview
Added OTP (One-Time Password) email verification for new users registering via Google OAuth.

## Changes Made

### Backend Changes

#### 1. New Entities
- **`services/user-service/src/auth/entities/otp.entity.ts`**
  - Stores OTP codes with expiration (10 minutes)
  - Tracks verification status

#### 2. New DTOs
- **`services/user-service/src/auth/dto/verify-otp.dto.ts`** - For OTP verification
- **`services/user-service/src/auth/dto/resend-otp.dto.ts`** - For resending OTP

#### 3. Updated User Entity
- Added `emailVerified` field (boolean, default: false)

#### 4. Updated Auth Service
- **`googleLogin()`** - Now checks if user is new and generates OTP
- **`generateAndSendOtp()`** - Creates 6-digit OTP and logs it (TODO: integrate email service)
- **`verifyOtp()`** - Validates OTP and marks email as verified
- **`resendOtp()`** - Regenerates and sends new OTP

#### 5. Updated Auth Controller
- **POST `/auth/verify-otp`** - Verify OTP endpoint
- **POST `/auth/resend-otp`** - Resend OTP endpoint
- **GET `/auth/google/callback`** - Now includes `requiresVerification` parameter

#### 6. Updated Auth Module
- Added `Otp` entity to TypeORM imports

### Frontend Changes

#### 1. New OTP Verification Page
- **`frontend/src/app/verify-otp/page.tsx`**
  - 6-digit OTP input with auto-focus
  - Paste support for OTP codes
  - Resend OTP functionality
  - Error and success messages

#### 2. Updated Auth Callback
- **`frontend/src/app/auth/callback/page.tsx`**
  - Checks `requiresVerification` parameter
  - Redirects to OTP page if verification needed
  - Otherwise proceeds to dashboard

#### 3. Fixed Google Button Alignment
- **`frontend/src/app/page.tsx`**
  - Made both buttons same width (full width on mobile)
  - Consistent padding (py-3.5)
  - Better visual alignment

## User Flow

### New User Registration via Google OAuth

1. User clicks "Continue with Google"
2. Google authentication completes
3. Backend creates new user (emailVerified: false)
4. Backend generates 6-digit OTP
5. OTP is logged to console (TODO: send via email)
6. User redirected to `/verify-otp?email=user@example.com`
7. User enters OTP code
8. Backend verifies OTP
9. User's `emailVerified` set to true
10. User redirected to dashboard

### Existing User Login via Google OAuth

1. User clicks "Continue with Google"
2. Google authentication completes
3. Backend finds existing user
4. If `emailVerified` is true → redirect to dashboard
5. If `emailVerified` is false → regenerate OTP and redirect to verification page

## OTP Details

- **Length**: 6 digits
- **Expiration**: 10 minutes
- **Storage**: Database (otps table)
- **Cleanup**: Expired OTPs deleted on verification attempt

## API Endpoints

### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend OTP
```http
POST /auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

## TODO: Email Integration

Currently, OTPs are logged to the console. To integrate email sending:

1. Install email service (e.g., nodemailer, sendgrid, AWS SES)
2. Update `generateAndSendOtp()` in `auth.service.ts`
3. Replace console.log with actual email sending
4. Add email templates for OTP

### Example with Nodemailer:

```typescript
import * as nodemailer from 'nodemailer';

async generateAndSendOtp(email: string): Promise<void> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save to database...
  
  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: 'ProNet <noreply@pronet.com>',
    to: email,
    subject: 'Verify Your Email - ProNet',
    html: `
      <h1>Welcome to ProNet!</h1>
      <p>Your verification code is:</p>
      <h2 style="font-size: 32px; letter-spacing: 5px;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}
```

## Testing

### Local Testing

1. Start services:
   ```bash
   docker-compose up --build
   ```

2. Visit `http://localhost:3000`

3. Click "Continue with Google"

4. Complete Google auth

5. Check backend logs for OTP:
   ```
   OTP for user@example.com: 123456
   OTP expires at: 2024-01-01T12:10:00.000Z
   ```

6. Enter OTP on verification page

7. Should redirect to dashboard

### Production Testing

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Test OAuth flow
4. Check Render logs for OTP
5. Verify email verification works

## Database Migration

The new `otps` table and `emailVerified` column will be created automatically by TypeORM on first run.

If you need to manually create them:

```sql
-- Add emailVerified column to users table
ALTER TABLE users ADD COLUMN "emailVerified" boolean DEFAULT false;

-- Create otps table
CREATE TABLE otps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar NOT NULL,
  otp varchar NOT NULL,
  verified boolean DEFAULT false,
  "createdAt" timestamp DEFAULT now(),
  "expiresAt" timestamp NOT NULL
);
```

## Security Considerations

1. **OTP Expiration**: 10 minutes (configurable)
2. **One-time use**: OTP deleted after successful verification
3. **Rate limiting**: Consider adding rate limiting to prevent abuse
4. **Brute force protection**: Consider limiting verification attempts
5. **HTTPS only**: Ensure all communication is over HTTPS in production

## UI/UX Improvements

1. **Button Alignment**: Both Google and Email buttons now have consistent sizing
2. **Auto-focus**: OTP inputs auto-focus on next field
3. **Paste Support**: Can paste 6-digit code directly
4. **Visual Feedback**: Clear error and success messages
5. **Resend Option**: Easy to request new OTP if needed

## Files Modified

### Backend
- `services/user-service/src/auth/auth.service.ts`
- `services/user-service/src/auth/auth.controller.ts`
- `services/user-service/src/auth/auth.module.ts`
- `services/user-service/src/users/entities/user.entity.ts`

### Backend (New Files)
- `services/user-service/src/auth/entities/otp.entity.ts`
- `services/user-service/src/auth/dto/verify-otp.dto.ts`
- `services/user-service/src/auth/dto/resend-otp.dto.ts`

### Frontend
- `frontend/src/app/page.tsx` (button alignment fix)
- `frontend/src/app/auth/callback/page.tsx` (OTP redirect logic)

### Frontend (New Files)
- `frontend/src/app/verify-otp/page.tsx`

## Next Steps

1. ✅ OTP verification implemented
2. ✅ UI button alignment fixed
3. ⏳ Integrate email service (SendGrid, AWS SES, etc.)
4. ⏳ Add rate limiting for OTP requests
5. ⏳ Add email templates
6. ⏳ Add OTP attempt limiting (max 3-5 attempts)
7. ⏳ Add analytics for verification success rate

## Support

For issues or questions:
1. Check backend logs for OTP codes during development
2. Verify database has `otps` table and `emailVerified` column
3. Ensure frontend environment variables are set correctly
4. Test with different email providers
