# Account Deletion Fix - Part 7: Community Events and Meeting Rooms

## Issue
While fixing the `groups` deletion issue, I identified other potential foreign key constraints that would block community deletion:
1.  `CommunityEvent` entities linked to the community.
2.  `MeetingRoom` entities linked to the community.

If a user created a community, and that community has events or meetings (created by anyone), deleting the community would fail.

## Fix Implementation
1.  **Updated `UsersModule`**: Imported `BreakoutRoom` entity.
2.  **Updated `UsersService`**:
    *   Injected `BreakoutRoomRepository`.
    *   In `deleteAccount` method, inside the community deletion loop:
        *   Added logic to find and delete all `CommunityEvent`s (and their attendees).
        *   Added logic to find and delete all `MeetingRoom`s (and their participants, polls, QAs, and breakout rooms).

## Verification
*   This ensures that `Community` deletion is truly comprehensive and won't be blocked by any child entities.
*   The order of deletion is: Members -> Articles -> Posts -> Events -> Meetings -> Groups -> Community.
