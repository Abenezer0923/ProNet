# Fix Image Upload Issue

## Changes Made

### 1. Increased File Size Limits
- Frontend: 5MB → 15MB
- Backend: Added 50MB body parser limit

### 2. Added Generic Upload Endpoint
- `POST /upload` - accepts any file upload
- Returns `{ url: string }`

### 3. Updated Profile DTO
- Added `profilePicture` field
- Added `coverPhoto` field

### 4. Improved Error Handling
- Better error messages
- Detailed console logging
- Shows actual error from backend

## To Fix the 500 Error

### Option 1: Restart Docker Containers (Recommended)
```bash
# Stop all containers
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Option 2: Restart Just the User Service
```bash
# Restart user service
docker-compose restart user-service

# Check logs
docker-compose logs -f user-service
```

### Option 3: Check Cloudinary Configuration
The error might be from Cloudinary. Check if credentials are valid:

```bash
# Check .env file
cat services/user-service/.env | grep CLOUDINARY
```

Make sure these are set:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Testing the Upload

1. **Restart the containers** (most important!)
2. Go to your profile page
3. Hover over profile picture → camera icon appears
4. Click to upload
5. Select an image (max 15MB)
6. Check browser console for detailed errors if it fails

## Common Issues

### Issue: "Request failed with status code 500"
**Solution:** Restart Docker containers to apply new code changes

### Issue: "Cloudinary error"
**Solution:** Check Cloudinary credentials in .env file

### Issue: "File too large"
**Solution:** Image must be under 15MB

### Issue: "Invalid file type"
**Solution:** Only JPEG, PNG, GIF, and WebP are allowed

## Debug Steps

1. **Check backend logs:**
   ```bash
   docker-compose logs -f user-service
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Error details:" message

3. **Test upload endpoint directly:**
   ```bash
   curl -X POST http://localhost:3001/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@/path/to/image.jpg"
   ```

## After Restart

The upload should work with:
- ✅ Profile picture upload
- ✅ Cover photo upload
- ✅ Up to 15MB file size
- ✅ Better error messages
- ✅ Loading spinners
- ✅ Auto-refresh after upload
