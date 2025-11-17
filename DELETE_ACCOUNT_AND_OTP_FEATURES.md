# Delete Account & OTP After Logout Features

## Overview
Added two important security and account management features:
1. **Delete Account** - Users can permanently delete their account from the profile page
2. **OTP Verification After Logout** - Users must verify with OTP when logging back in after logout

## Features Implemented

### 1. Delete Account Functionality

#### Backend
- **Endpoint**: `DELETE /users/account`
- **Authentication**: Required (JWT)
- **Functionality**:
  - Deletes all user connections (followers/following)
  - Deletes all user skills
  - Deletes the user account
  - Returns success message

#### Frontend
- **Location**: Profile page (`/profile`)
- **UI**: "Danger Zone" section with red styling
- **Confirmation**: Double confirmation dialog to prevent accidental deletion
- **Flow**:
  1. User clicks "Delete Account" button
  2. First confirmation: "Are you absolutely sure?"
  3. Second confirmation: "This will permanently delete all your data"
  4. Account deleted
  5. User logged out and redirected to home page

### 2. OTP Verification After Logout

#### Backend

**New Entity**: `LoginSession`
- Tracks user login sessions
- Stores `requiresOtp` flag
- Records last login time

**New Endpoints**:
- `POST /auth/logout` - Marks session as requiring OTP
- `POST /auth/login-with-otp` - Verifies OTP and logs user in

**Updated Endpoints**:
- `POST /auth/login` - Checks if OTP is required before logging in

**Flow**:
1. User logs out → session marked as `requiresOtp: true`
2. User tries to log in → backend checks session
3. If `requiresOtp` is true → generate and send OTP
4. User enters OTP → verified and logged in
5. Session updated to `requiresOtp: false`

#### Frontend

**Updated Pages**:
- **Login Page** (`/login`):
  - Checks if OTP is required in login response
  - Redirects to OTP verification if needed
  - Otherwise proceeds with normal login

- **OTP Verification Page** (`/verify-otp`):
  - Supports two types: `register` and `login`
  - Different messaging based on type
  - Uses different API endpoint based on type
  - Stores token and redirects to dashboard on success

**Updated Context**:
- **AuthContext**: `logout()` now calls backend endpoint before clearing local storage

## User Flows

### Delete Account Flow

```
Profile Page
    ↓
Click "Delete Account"
    ↓
First Confirmation Dialog
    ↓
Second Confirmation Dialog
    ↓
API Call: DELETE /users/account
    ↓
Success Message
    ↓
Clear Local Storage
    ↓
Redirect to Home Page
```

### OTP After Logout Flow

```
Dashboard (Logged In)
    ↓
Click "Logout"
    ↓
API Call: POST /auth/logout
    ↓
Session marked requiresOtp: true
    ↓
Clear Local Storage
    ↓
Redirect to Login Page
    ↓
Enter Email & Password
    ↓
API Call: POST /auth/login
    ↓
Response: { requiresOtp: true, email: "..." }
    ↓
Redirect to /verify-otp?email=...&type=login
    ↓
Enter 6-Digit OTP
    ↓
API Call: POST /auth/login-with-otp
    ↓
Response: { user, token }
    ↓
Store Token & Redirect to Dashboard
```

## Database Changes

### New Tables

**login_sessions**
```sql
CREATE TABLE login_sessions (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  email VARCHAR NOT NULL,
  requiresOtp BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  lastLoginAt TIMESTAMP
);
```

## API Endpoints

### Delete Account
```http
DELETE /users/account
Authorization: Bearer <token>

Response:
{
  "message": "Account deleted successfully"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

### Login (with OTP check)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (OTP Required):
{
  "requiresOtp": true,
  "email": "user@example.com",
  "message": "OTP sent to your email"
}

Response (Normal Login):
{
  "user": { ... },
  "token": "jwt-token",
  "requiresOtp": false
}
```

### Login with OTP
```http
POST /auth/login-with-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "user": { ... },
  "token": "jwt-token"
}
```

## Security Features

### Delete Account
1. **Double Confirmation**: Prevents accidental deletion
2. **Authentication Required**: Only logged-in users can delete their account
3. **Complete Data Removal**: All related data is deleted
4. **Immediate Logout**: User is logged out after deletion

### OTP After Logout
1. **Session Tracking**: Tracks when users log out
2. **OTP Verification**: Requires OTP on next login for security
3. **Time-Limited OTP**: OTP expires in 10 minutes
4. **One-Time Use**: OTP is deleted after successful verification

## Testing

### Test Delete Account

1. **Local Testing**:
   ```bash
   docker-compose up
   ```
   - Visit `http://localhost:3000`
   - Log in
   - Go to profile page
   - Scroll to "Danger Zone"
   - Click "Delete Account"
   - Confirm twice
   - Account should be deleted

2. **Production Testing**:
   - Visit `https://pro-net-ten.vercel.app`
   - Same steps as local

### Test OTP After Logout

1. **Local Testing**:
   ```bash
   docker-compose up
   ```
   - Visit `http://localhost:3000`
   - Log in with email/password
   - Click "Logout"
   - Try to log in again
   - Should be redirected to OTP verification
   - Check backend logs for OTP code
   - Enter OTP
   - Should be logged in

2. **Production Testing**:
   - Visit `https://pro-net-ten.vercel.app`
   - Same steps as local
   - Check Render logs for OTP code

## Files Modified

### Backend
- `services/user-service/src/users/users.controller.ts` - Added delete account endpoint
- `services/user-service/src/users/users.service.ts` - Added deleteAccount method
- `services/user-service/src/auth/auth.service.ts` - Added logout, loginWithOtp, session tracking
- `services/user-service/src/auth/auth.controller.ts` - Added logout and login-with-otp endpoints
- `services/user-service/src/auth/auth.module.ts` - Added LoginSession entity

### Backend (New Files)
- `services/user-service/src/auth/entities/login-session.entity.ts` - Session tracking entity

### Frontend
- `frontend/src/app/profile/page.tsx` - Added delete account button and handler
- `frontend/src/app/login/page.tsx` - Added OTP check in login flow
- `frontend/src/app/verify-otp/page.tsx` - Added support for login verification type
- `frontend/src/contexts/AuthContext.tsx` - Updated logout to call backend
- `frontend/src/lib/api.ts` - Added logout, loginWithOtp, verifyOtp endpoints

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `JWT_SECRET` - For token generation
- `FRONTEND_URL` - For redirects
- `NEXT_PUBLIC_API_URL` - For API calls

## Notes

1. **OTP Delivery**: Currently OTPs are logged to console. In production, integrate an email service (SendGrid, AWS SES, etc.)

2. **Session Cleanup**: Consider adding a cron job to clean up old login sessions

3. **Rate Limiting**: Consider adding rate limiting to prevent OTP abuse

4. **Account Recovery**: Consider adding account recovery option before permanent deletion

5. **Data Export**: Consider allowing users to export their data before deletion (GDPR compliance)

## Future Enhancements

1. **Email Service Integration**: Send OTPs via email instead of logging
2. **SMS OTP Option**: Allow users to receive OTP via SMS
3. **Account Deactivation**: Add option to deactivate instead of delete
4. **Deletion Grace Period**: 30-day grace period before permanent deletion
5. **Data Export**: Allow users to download their data before deletion
6. **Audit Log**: Track account deletions for compliance
7. **2FA Option**: Allow users to enable permanent 2FA instead of just after logout

## Support

### Common Issues

**Issue**: OTP not received
- **Solution**: Check backend logs for OTP code (development)
- **Solution**: Verify email service is configured (production)

**Issue**: Can't delete account
- **Solution**: Ensure you're logged in
- **Solution**: Check backend logs for errors

**Issue**: OTP verification fails
- **Solution**: Check if OTP has expired (10 minutes)
- **Solution**: Request new OTP using "Resend OTP" button

## Deployment

After pushing to GitHub:
1. **Render** will automatically redeploy the backend
2. **Vercel** will automatically redeploy the frontend
3. Wait 2-3 minutes for deployments to complete
4. Test the new features

The `login_sessions` and `otps` tables will be created automatically by TypeORM on first deployment.

---

**Status**: ✅ Implemented and Deployed
**Version**: 1.0.0
**Date**: November 17, 2025
