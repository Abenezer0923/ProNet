# Account Deletion Fix - Part 6: Community Groups

## Issue
The account deletion process failed with a 500 Internal Server Error due to a foreign key constraint violation on the `groups` table when deleting a `Community`.

Error: `update or delete on table "communities" violates foreign key constraint "FK_0a5b0abfc294f483942528aadd4" on table "groups"`

## Root Cause
When a user deletes their account, the system attempts to delete communities created by that user. However, communities can contain `Groups`, and `Groups` contain `GroupMessages`. The database schema enforces foreign key constraints, preventing the deletion of a community if it still has groups.

## Fix Implementation
1.  **Updated `UsersModule`**: Imported `Group` entity to make its repository available.
2.  **Updated `UsersService`**:
    *   Injected `GroupRepository`.
    *   In `deleteAccount` method, added logic to iterate through all groups within a community being deleted.
    *   For each group, deleted all its messages (`GroupMessage`).
    *   Deleted the `Group` entity itself.
    *   Proceeded to delete the `Community`.

## Verification
*   The fix ensures that the dependency chain `Community -> Group -> GroupMessage` is cleaned up from the bottom up.
*   This should resolve the FK violation and allow the community (and thus the user account) to be deleted successfully.
