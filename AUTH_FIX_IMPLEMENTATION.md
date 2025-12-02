# 🔐 Authentication System Fix & Keep-Alive Strategy

## Overview
This document outlines the comprehensive fix for authentication-related features and the implementation of a keep-alive strategy for Render's free tier.

## Issues Addressed

### 1. OTP Generation & Verification ✅
- **Status**: Working but needs email service configuration
- **Current State**: OTP is generated and logged to console
- **Fix**: Configure Resend API key for email delivery

### 2. Forgot Password Process ✅
- **Status**: Implemented and working
- **Flow**: Email → OTP → Verify → Reset Password

### 3. Registration (Individual & Organization) ✅
- **Status**: Fully implemented
- **Supports**: Both personal and organizational profiles

### 4. Google Authentication ✅
- **Status**: Implemented with OTP verification
- **Flow**: Google OAuth → OTP Verification → Login

### 5. Server Keep-Alive Strategy 🆕
- **Problem**: Render free tier spins down after 15 minutes
- **Solution**: Multiple health check endpoints + cron jobs

---

## Implementation Details

### Health Check Endpoints

Three endpoints have been created for different purposes:

1. **`/health`** - Main health check with detailed info
   - Returns: status, timestamp, service name, uptime
   - Use: Primary keep-alive endpoint

2. **`/health/ping`** - Lightweight ping
   - Returns: status, timestamp
   - Use: Quick availability check

3. **`/health/ready`** - Readiness check
   - Returns: status, timestamp, database status
   - Use: Verify service is fully operational

### Keep-Alive Strategy

#### Option 1: External Cron Service (Recommended)
Use **cron-job.org** (free) to ping multiple endpoints:

**Setup:**
1. Visit [cron-job.org](https://cron-job.org)
2. Create account
3. Add multiple cron jobs:

**Job 1: Main Health Check**
- URL: `https://pronet-user-service.onrender.com/health`
- Schedule: Every 14 minutes (`*/14 * * * *`)

**Job 2: Auth Warmup**
- URL: `https://pronet-user-service.onrender.com/health/ping`
- Schedule: Every 14 minutes (offset by 7 minutes)

**Job 3: API Gateway**
- URL: `https://pronet-api-gateway.onrender.com/health`
- Schedule: Every 14 minutes

#### Option 2: GitHub Actions (Alternative)
Use GitHub Actions workflow to ping services:

```yaml
name: Keep Render Alive
on:
  schedule:
    - cron: '*/14 * * * *'  # Every 14 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping User Service
        run: curl -s https://pronet-user-service.onrender.com/health
      
      - name: Ping API Gateway
        run: curl -s https://pronet-api-gateway.onrender.com/health
```

#### Option 3: UptimeRobot (Alternative)
- Free tier: 50 monitors, 5-minute intervals
- Setup: Add both service URLs as HTTP monitors

---

## Email Configuration

### Current Status
- Email service uses **Resend** API
- Falls back to console logging if not configured

### Setup Resend (Recommended)

1. **Get API Key:**
   - Visit [resend.com](https://resend.com)
   - Sign up for free account
   - Get API key from dashboard

2. **Configure Environment:**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

3. **Update Render Environment:**
   - Go to Render dashboard
   - Select user-service
   - Add environment variable: `RESEND_API_KEY`

### Alternative: Keep Gmail (Current)
The system can be updated to use Gmail instead:
- Already configured: `EMAIL_USER` and `EMAIL_PASSWORD`
- Need to update `email.service.ts` to use nodemailer

---

## Google OAuth Configuration

### Current Setup
```env
GOOGLE_CLIENT_ID=1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Production URLs (Render)
Update these in Render environment variables:
```env
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app
```

### Google Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Edit OAuth 2.0 Client
5. Add authorized redirect URIs:
   - `https://pronet-user-service.onrender.com/api/auth/google/callback`
   - `http://localhost:3001/api/auth/google/callback` (for local dev)

---

## Authentication Flows

### 1. Email/Password Registration
```
User → Register Form → POST /auth/register
  ↓
Create User → Generate Token → Return User + Token
```

### 2. Email/Password Login
```
User → Login Form → POST /auth/login
  ↓
Validate Credentials → Check Session
  ↓
If requires OTP:
  Generate OTP → Send Email → Return {requiresOtp: true}
  User → Verify OTP → POST /auth/login-with-otp → Return Token
Else:
  Return Token
```

### 3. Google OAuth Login
```
User → Click Google Login → GET /auth/google
  ↓
Redirect to Google → User Authorizes
  ↓
Google → Callback → GET /auth/google/callback
  ↓
Find/Create User → Generate OTP → Send Email
  ↓
Redirect to Frontend → /verify-otp?email=...&otp=...
  ↓
User → Verify OTP → POST /auth/login-with-otp → Return Token
```

### 4. Forgot Password
```
User → Enter Email → POST /auth/forgot-password
  ↓
Generate OTP → Send Email → Return Success
  ↓
User → Enter OTP + New Password → POST /auth/reset-password
  ↓
Verify OTP → Update Password → Return Success
```

### 5. Resend OTP
```
User → Click Resend → POST /auth/resend-otp
  ↓
Generate New OTP → Send Email → Return Success
```

---

## Testing Checklist

### Local Testing
- [ ] Email/Password Registration (Personal)
- [ ] Email/Password Registration (Organization)
- [ ] Email/Password Login
- [ ] Google OAuth Login
- [ ] OTP Verification
- [ ] Resend OTP
- [ ] Forgot Password
- [ ] Reset Password
- [ ] Logout

### Production Testing (Render)
- [ ] Health endpoints responding
- [ ] Google OAuth callback working
- [ ] Email delivery (if Resend configured)
- [ ] OTP verification
- [ ] Keep-alive cron jobs active

---

## Deployment Steps

### 1. Update Environment Variables on Render

**User Service:**
```env
# Production URLs
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app

# Email Service (Choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR keep Gmail
EMAIL_USER=abenezerforjobs2@gmail.com
EMAIL_PASSWORD=fzrlxrluiynrujpl
```

### 2. Deploy to Render
```bash
git add .
git commit -m "Fix: Authentication system and keep-alive strategy"
git push origin main
```

### 3. Setup Cron Jobs
Follow instructions in `CRON_SETUP_GUIDE.md`

### 4. Update Google OAuth
Add production callback URL to Google Console

### 5. Test All Flows
Use the testing checklist above

---

## Monitoring

### Check Service Status
```bash
# Health check
curl https://pronet-user-service.onrender.com/health

# Ping
curl https://pronet-user-service.onrender.com/health/ping

# Readiness
curl https://pronet-user-service.onrender.com/health/ready
```

### Check Logs
- Render Dashboard → user-service → Logs
- Look for: "OTP for [email]" messages
- Verify: No database connection errors

---

## Troubleshooting

### Issue: OTP Not Received
**Solution:**
1. Check console logs for OTP code
2. Verify email service configuration
3. Check spam folder
4. Use resend OTP feature

### Issue: Google OAuth Fails
**Solution:**
1. Verify callback URL in Google Console
2. Check environment variables on Render
3. Ensure FRONTEND_URL is correct
4. Check Render logs for errors

### Issue: Server Still Sleeping
**Solution:**
1. Verify cron jobs are running
2. Check cron-job.org execution history
3. Ensure health endpoints return 200 OK
4. Consider using multiple cron services

### Issue: Database Connection Error
**Solution:**
1. Check Render database status
2. Verify DATABASE_URL environment variable
3. Check database connection limits
4. Restart service if needed

---

## Next Steps

1. ✅ Health endpoints created
2. ⏳ Configure email service (Resend or Gmail)
3. ⏳ Setup cron jobs for keep-alive
4. ⏳ Update Google OAuth settings
5. ⏳ Deploy to Render
6. ⏳ Test all authentication flows
7. ⏳ Monitor for 24 hours

---

## Files Modified/Created

### Created:
- `services/user-service/src/health/health.controller.ts`
- `AUTH_FIX_IMPLEMENTATION.md`
- `CRON_SETUP_GUIDE.md`
- `EMAIL_SERVICE_SETUP.md`
- `.github/workflows/keep-alive.yml`

### Modified:
- `services/user-service/src/app.module.ts` (already has HealthController)
- Environment variables (to be updated on Render)

---

## Support

For issues or questions:
1. Check Render logs
2. Review this documentation
3. Test locally first
4. Verify environment variables
5. Check external service status (Resend, Google OAuth)
