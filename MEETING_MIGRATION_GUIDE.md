# Meeting System Migration Guide: Daily.co to Jitsi Meet

## Overview
The video meeting system has been migrated from Daily.co (paid/limited free tier) to Jitsi Meet (free, open source). This change was made to avoid payment method requirements for the demo/trial version.

## Changes

### Backend (`services/user-service`)
- **Service**: `MeetingsService`
  - Removed `dailyApiKey` and `dailyApiUrl`.
  - Removed `callDailyApi` method.
  - `createMeetingRoom`: Now generates a Jitsi URL (`https://meet.jit.si/...`) and a unique room name (`ProNet-{groupId}-{uuid}`).
  - `joinMeeting`: Returns the Jitsi URL directly. No token generation is required for the public Jitsi server.
  - `endMeeting`: Removed API call to delete room (Jitsi rooms are ephemeral).
  - `createBreakoutRooms`: Generates Jitsi URLs for breakout rooms.
- **Dependencies**: Removed `@daily-co/daily-js`.

### Frontend (`frontend`)
- **Component**: `MeetingRoom.tsx`
  - Removed `DailyIframe` integration.
  - Added `JitsiMeetExternalAPI` integration via dynamic script loading (`https://meet.jit.si/external_api.js`).
  - The video interface is now provided by the Jitsi iframe.
  - Custom side panels (Polls, Q&A) are preserved as overlays.
- **Dependencies**: Removed `@daily-co/daily-js` and `@daily-co/daily-react`.

## Usage
- **Creating a Meeting**: Works as before. A Jitsi URL is automatically generated.
- **Joining a Meeting**: The frontend will load the Jitsi interface.
- **Features**:
  - Video/Audio/Screen Share: Handled by Jitsi.
  - Chat: Jitsi has built-in chat, but ProNet also has a separate persistent chat system.
  - Polls/Q&A: Handled by ProNet's custom side panels.
  - Recording: Jitsi supports recording to Dropbox (user's account) or local recording, depending on the server config. The public Jitsi server has some limitations.

## Future Improvements
- **Self-Hosted Jitsi**: For production, consider self-hosting a Jitsi instance (Docker) to have full control over privacy, recording, and authentication (JWT).
- **JWT Authentication**: Implement JWT generation for Jitsi to secure rooms (prevent unauthorized access). Currently, rooms are public but have unique UUIDs.
