# Account Deletion Fix - Part 5 (Final Comprehensive - Meetings & Events)

This update adds handling for `MeetingRoom`, `MeetingPoll`, `MeetingQA`, `CommunityEvent`, and their related entities. This ensures that all user interactions within meetings and events are also cleaned up.

## Changes Made

1.  **Updated `UsersModule`**: Imported `MessageReaction`, `MeetingRoom`, `MeetingParticipant`, `MeetingPoll`, `MeetingPollVote`, `MeetingQA`, `MeetingQAUpvote`, `CommunityEvent`, and `EventAttendee` entities.
2.  **Updated `UsersService`**:
    *   Injected repositories for all the above entities.
    *   Updated `deleteAccount` method to:
        *   Delete `MessageReaction`s by the user.
        *   Delete `MeetingPollVote`s and `MeetingQAUpvote`s by the user.
        *   Delete `MeetingParticipant` and `EventAttendee` records for the user.
        *   Delete `MeetingQA` questions asked by the user.
        *   Update `MeetingQA` answers by the user (set `answeredBy` to null).
        *   Delete `MeetingPoll`s created by the user (and their votes).
        *   Delete `CommunityEvent`s organized by the user (and their attendees).
        *   Delete `MeetingRoom`s hosted by the user (and their participants, polls, QAs).

## File Changes

*   `services/user-service/src/users/users.module.ts`
*   `services/user-service/src/users/users.service.ts`

## Verification

This should resolve any remaining foreign key constraint violations related to meetings and events.
