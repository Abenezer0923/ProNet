# Account Deletion Fix

The account deletion functionality was failing with a 500 Internal Server Error due to foreign key constraints. The `deleteAccount` method in `UsersService` was only deleting `UserSkill` and `Connection` records, but not other related entities like `Experience`, `Education`, `Post`, `Comment`, `PostLike`, and `CommunityMember`.

## Changes Made

1.  **Updated `UsersModule`**: Imported `Post`, `Comment`, `PostLike`, and `CommunityMember` entities to make their repositories available.
2.  **Updated `UsersService`**:
    *   Injected repositories for `Post`, `Comment`, `PostLike`, and `CommunityMember`.
    *   Updated `deleteAccount` method to delete related records in the correct order:
        1.  Community Memberships
        2.  Post Likes (by user)
        3.  Comments (by user)
        4.  Posts (by user) - including comments and likes on those posts
        5.  Experience & Education
        6.  Connections (Followers/Following)
        7.  Skills
        8.  User record

## File Changes

*   `services/user-service/src/users/users.module.ts`
*   `services/user-service/src/users/users.service.ts`

## Verification

To verify the fix, try deleting an account that has:
*   Experiences
*   Educations
*   Posts
*   Comments
*   Likes
*   Community memberships

The deletion should now succeed without errors.
