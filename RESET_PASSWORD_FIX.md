# Reset Password Route Fix

## Problem
The reset password page was showing "Cannot POST /auth/reset-password" error.

## Root Cause
The User Service had a global prefix `/api` configured, but the API Gateway did not. This caused a mismatch:

- Frontend calls: `http://localhost:3000/auth/reset-password` (API Gateway)
- API Gateway forwards to: `http://localhost:3001/auth/reset-password` (User Service)
- User Service expects: `http://localhost:3001/api/auth/reset-password` ❌

## Solution
Added the `/api` global prefix to the API Gateway to match the User Service configuration.

### Changes Made

**services/api-gateway/src/main.ts**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to match user service
  app.setGlobalPrefix('api');
  
  // ... rest of configuration
}
```

## How It Works Now

1. Frontend calls: `http://localhost:3000/api/auth/reset-password` (API Gateway)
2. API Gateway forwards to: `http://localhost:3001/api/auth/reset-password` (User Service)
3. User Service receives: `/api/auth/reset-password` ✅

## Testing

### Local Testing
```bash
# Test forgot password (generates OTP)
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test reset password (with OTP from email/console)
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","newPassword":"NewPass123"}'
```

### Production Testing
```bash
# Test forgot password
curl -X POST https://your-api-gateway.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Test reset password
curl -X POST https://your-api-gateway.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","otp":"123456","newPassword":"NewPass123"}'
```

## Affected Routes
All routes now require the `/api` prefix when calling through the API Gateway:

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/verify-email`
- `/api/auth/resend-otp`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`
- `/api/auth/google`
- `/api/auth/google/callback`
- `/api/users/*`
- `/api/posts/*`
- `/api/communities/*`
- etc.

## Next Steps

1. Restart both services:
   ```bash
   # In services/api-gateway
   npm run start:dev
   
   # In services/user-service
   npm run start:dev
   ```

2. Test the reset password flow:
   - Go to http://localhost:3000/forgot-password
   - Enter your email
   - Check console/email for OTP
   - Go to reset password page
   - Enter OTP and new password
   - Submit

3. Verify all other auth routes still work correctly

## Notes

- The User Service can still be accessed directly on port 3001 with the `/api` prefix
- The API Gateway on port 3000 now also uses the `/api` prefix
- All frontend API calls should use `NEXT_PUBLIC_API_URL` which points to the API Gateway
- Google OAuth callbacks are configured with `/api/auth/google/callback`
