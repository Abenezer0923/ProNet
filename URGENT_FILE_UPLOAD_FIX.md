# Urgent File Upload Fix - ECONNRESET Issue

## Current Status
The file is being intercepted correctly in the gateway, but the connection is resetting when forwarding to user-service.

**Error:** `Proxy error for /upload: read ECONNRESET`

## Root Cause
The FormData recreation in the gateway is causing connection issues. The user-service might also need to be restarted to pick up the new Multer configuration.

## Immediate Fix Steps

### Step 1: Ensure Dependencies Are Installed

The API gateway needs `form-data` package. Make sure it's installed in production:

**In Render Dashboard:**
1. Go to API Gateway service
2. Go to "Environment" tab
3. Add build command if not present: `npm install`
4. Trigger manual deploy

### Step 2: Alternative Approach - Direct Upload

Instead of going through the gateway, we can bypass it for uploads. Update the frontend to upload directly to user-service for now.

**Quick Frontend Fix:**

In `frontend/src/app/profile/page.tsx`, change the upload endpoint:

```typescript
// Instead of:
const response = await api.post('/upload', formData, ...);

// Use direct user-service URL temporarily:
const response = await axios.post(
  'https://pronet-user-service.onrender.com/upload',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }
);
```

### Step 3: Check Render Logs

1. Go to Render dashboard
2. Open user-service logs
3. Look for any startup errors
4. Verify Multer is loaded

### Step 4: Manual Restart

Sometimes services need a hard restart:

1. Go to Render dashboard
2. Click on user-service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait for deployment
5. Do the same for api-gateway

## Better Long-term Solution

The issue is that we're trying to proxy file uploads through the gateway. A better approach:

### Option A: Direct Upload (Recommended for Now)
- Frontend uploads directly to user-service
- Bypasses gateway for file uploads only
- Simpler, more reliable

### Option B: Use HTTP Proxy Instead of Axios
- Replace axios with http-proxy-middleware
- Streams data without parsing
- Better for large files

### Option C: Upload to Cloudinary from Frontend
- Get signed upload URL from backend
- Upload directly from browser to Cloudinary
- Most scalable solution

## Implementing Option A (Quick Fix)

### 1. Update Frontend API Configuration

Create a new file: `frontend/src/lib/upload-api.ts`

```typescript
import axios from 'axios';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 
  'https://pronet-user-service.onrender.com';

export const uploadApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth token to requests
uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Update Profile Page

In `frontend/src/app/profile/page.tsx`:

```typescript
import { uploadApi } from '@/lib/upload-api';

// In handleProfilePictureUpload:
const response = await uploadApi.post('/upload', formData);
```

### 3. Update Environment Variables

Add to `frontend/.env.local`:
```
NEXT_PUBLIC_USER_SERVICE_URL=https://pronet-user-service.onrender.com
```

Add to Vercel environment variables:
```
NEXT_PUBLIC_USER_SERVICE_URL=https://pronet-user-service.onrender.com
```

## Testing After Fix

1. Deploy frontend changes
2. Wait 2-3 minutes
3. Try uploading a profile picture
4. Should work directly to user-service

## Why This Works

- Bypasses the problematic gateway proxy
- Direct connection to user-service
- User-service already has proper Multer configuration
- Simpler data flow
- No FormData recreation needed

## Monitoring

Check these logs after implementing:

**User Service (should see):**
```
Uploading file: { originalname: 'profile.jpg', ... }
Starting Cloudinary upload
Cloudinary upload successful
```

**API Gateway (should NOT see upload requests):**
```
(No upload logs - uploads bypass gateway)
```

## Rollback Plan

If this doesn't work:
1. Revert frontend changes
2. Check Cloudinary credentials
3. Verify user-service is running
4. Check user-service logs for specific errors

## Next Steps After This Works

Once uploads work with direct connection:
1. Implement proper file upload proxy in gateway
2. Or keep direct upload (it's actually better for performance)
3. Update documentation
4. Add rate limiting for uploads

---

**Priority:** HIGH
**Estimated Time:** 10 minutes
**Risk:** Low - Only affects file uploads
**Rollback:** Easy - revert one file
