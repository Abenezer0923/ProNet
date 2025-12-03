# Account Deletion Fix - Part 2

The previous fix for account deletion missed the `conversations` and `messages` tables, which also have foreign key constraints referencing the `users` table.

## Changes Made

1.  **Updated `UsersModule`**: Imported `Conversation` and `Message` entities.
2.  **Updated `UsersService`**:
    *   Injected `Conversation` and `Message` repositories.
    *   Updated `deleteAccount` method to include deletion of chat data:
        *   Find all conversations where the user is a participant (`participant1` or `participant2`).
        *   For each conversation, delete all messages.
        *   Delete the conversation itself.

## File Changes

*   `services/user-service/src/users/users.module.ts`
*   `services/user-service/src/users/users.service.ts`

## Verification

To verify the fix, try deleting an account that has participated in chat conversations. The deletion should now succeed.
