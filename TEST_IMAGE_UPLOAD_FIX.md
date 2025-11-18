# Test Image Upload Fix

## Quick Test Steps

### 1. Restart the Backend
```bash
cd services/user-service
npm run start:dev
```

Wait for the message: `🚀 User Service running on http://localhost:3001`

### 2. Test in Browser
1. Open http://localhost:3000/profile
2. Hover over your profile picture (you'll see a camera icon overlay)
3. Click on the profile picture
4. Select an image file from your computer
5. Wait for the upload to complete
6. Your profile picture should update immediately

### 3. Check for Errors
Open the browser console (F12) and look for:
- ✅ Success: No errors, image updates
- ❌ Error: Check the error message

### 4. Check Backend Logs
In the terminal where user-service is running, you should see:
```
Uploading file: { originalname: '...', mimetype: 'image/...', size: ..., buffer: 'present' }
Starting Cloudinary upload to folder: pronet/profiles
Cloudinary upload successful: https://res.cloudinary.com/...
Upload successful: https://res.cloudinary.com/...
```

## Common Issues & Solutions

### Issue: "No file uploaded"
**Solution:** Make sure you're selecting a file in the file picker dialog

### Issue: "Invalid file type"
**Solution:** Only JPEG, PNG, GIF, and WebP files are supported

### Issue: "File size must be less than 15MB"
**Solution:** Compress your image or use a smaller file

### Issue: "Cloudinary upload failed"
**Solution:** Check your Cloudinary credentials in `.env`:
```bash
cd services/user-service
cat .env | grep CLOUDINARY
```

Should show:
```
CLOUDINARY_CLOUD_NAME=dgl4cpuik
CLOUDINARY_API_KEY=637454513411741
CLOUDINARY_API_SECRET=7JHtL4bTAYqwq7RaQM60Ocf43fw
```

### Issue: Still getting 500 error
**Solution:** 
1. Stop the user-service (Ctrl+C)
2. Clear any cached builds: `rm -rf dist`
3. Rebuild: `npm run build`
4. Start again: `npm run start:dev`

## Test Different Upload Scenarios

### Test 1: Profile Picture
- Go to `/profile`
- Click on profile picture
- Upload image

### Test 2: Cover Photo
- Go to `/profile`
- Hover over cover photo area
- Click "Edit cover photo"
- Upload image

### Test 3: Edit Profile Page
- Go to `/profile/edit`
- Use the ImageUpload component
- Upload image

## Verify Upload Success

After successful upload, check:
1. ✅ Image appears immediately on the page
2. ✅ No error messages in console
3. ✅ Backend logs show successful upload
4. ✅ Refresh page - image persists
5. ✅ Image URL starts with `https://res.cloudinary.com/`

## Debug Mode

If you need more detailed logs, add this to your browser console:
```javascript
localStorage.setItem('debug', 'true');
```

Then try uploading again and check the console for detailed logs.

## Expected Response Format

Successful upload returns:
```json
{
  "url": "https://res.cloudinary.com/dgl4cpuik/image/upload/v1234567890/pronet/profiles/abc123.jpg"
}
```

## Performance Notes

- Small images (< 1MB): Upload in 1-3 seconds
- Medium images (1-5MB): Upload in 3-8 seconds
- Large images (5-15MB): Upload in 8-15 seconds

Times may vary based on internet connection speed.
