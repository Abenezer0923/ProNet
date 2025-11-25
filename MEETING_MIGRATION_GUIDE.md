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

## Implementation Notes & Known Warnings

### Container Mount Requirement
The Jitsi External API requires that the parent container DOM node already exists before instantiation. In the React component we:
- Render the `<div id="jitsi-container" ref={...} />` immediately.
- Show a translucent overlay for the loading state instead of conditionally rendering the container.
If you move the Jitsi init code, ensure the container is present; otherwise you will see `Cannot read properties of null (reading 'appendChild')`.

### React StrictMode Double Mount (Development Only)
In Next.js development mode React can mount components twice, causing duplicate socket connect / disconnect logs. The `useCommunitySocket` hook now guards against duplicate connections. These extra logs do not appear in production builds.

### Jitsi Console Warnings
You may see benign warnings such as:
- `Unrecognized feature: 'speaker-selection'` (occurs when a toolbar or interface feature isn't supported on the public instance)
- Missing sound IDs like `RECORDING_OFF_SOUND` (public meet.jit.si doesn’t bundle every asset)
We trimmed the toolbar to essentials to reduce noise. These warnings are safe to ignore.

### Ad/Tracking Blocker Errors (Amplitude)
Errors like `Failed to fetch remote configuration` or `net::ERR_BLOCKED_BY_CLIENT` for Amplitude/analytics occur when browser extensions block requests. They do not affect meeting functionality.

### Network 404 / ERR_FAILED Assets
Occasional 404s for auxiliary assets (extension hints, legacy bundles) are non-critical. The Jitsi core script and media flows are unaffected.

### Recommended Production Hardening
1. Self-host Jitsi to remove third-party analytics and gain config control.
2. Enable JWT room protection.
3. Provide custom sounds/assets to eliminate missing sound warnings.
4. Implement a health check that retries init if external script fails to load (rare intermittent CDN issues).

### Socket Stability Changes
The community socket hook was updated to:
- Prevent duplicate connections under React StrictMode.
- Avoid repeated join/leave loops by tracking current group membership.
- Prefer pure websocket transport to reduce disconnect churn.

If you still observe frequent disconnects, verify:
1. Browser dev tools aren’t throttling network.
2. Server keeps the namespace `/communities` alive and isn’t restarting.
3. No proxy timeouts (<30s) prematurely closing idle connections.

### Minimal Toolbar Configuration
We now use:
`['microphone','camera','desktop','chat','raisehand','tileview','hangup','fullscreen','settings']`
Add buttons back as needed; consult Jitsi docs to avoid deprecated entries.

