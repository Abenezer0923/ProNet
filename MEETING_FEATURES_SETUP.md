# Group Meeting Features - Setup Guide

## Quick Start

### 1. Get Daily.co API Key

1. Go to https://dashboard.daily.co
2. Sign up for a free account (10,000 minutes/month free)
3. Navigate to "Developers" → "API Keys"
4. Copy your API key

### 2. Configure Backend

Add to `services/user-service/.env`:

```bash
DAILY_API_KEY=your_daily_api_key_here
```

### 3. Start Services

```bash
# Backend
cd services/user-service
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### 4. Test the Features

1. Navigate to a community
2. Create or select a group with type "meeting"
3. Click "Start Meeting"
4. Configure meeting settings
5. Join the meeting!

## Features Available

✅ **Video Conferencing** - Up to 100 participants
✅ **Screen Sharing** - Share your screen with participants
✅ **Recording** - Cloud recording (host only)
✅ **Breakout Rooms** - Split participants into smaller groups
✅ **Polls** - Create interactive polls during meetings
✅ **Q&A** - Participants can ask and upvote questions

## Important Notes

- **Daily.co API Key Required**: The system will not work without a valid Daily.co API key
- **Free Tier**: 10,000 minutes/month (sufficient for testing and small communities)
- **Paid Tier**: ~$0.004/minute for production use
- **Database**: New tables will be auto-created by TypeORM on first run

## Next Steps

1. Add Daily.co API key to `.env`
2. Restart backend service
3. Create a test meeting
4. Test with multiple browser windows/devices
5. Explore polls and Q&A features

For detailed implementation information, see [walkthrough.md](file:///home/abenezer/.gemini/antigravity/brain/d12ddd2d-ae43-44c9-9d44-6765c66e8326/walkthrough.md)
