# Account Deletion Fix - Part 4 (Final Comprehensive)

This update adds handling for `GroupMessage`, `ArticleComment`, and `ArticleClap` entities, ensuring that all user interactions within communities and articles are also cleaned up.

## Changes Made

1.  **Updated `UsersModule`**: Imported `GroupMessage`, `ArticleComment`, and `ArticleClap` entities.
2.  **Updated `UsersService`**:
    *   Injected repositories for `GroupMessage`, `ArticleComment`, and `ArticleClap`.
    *   Updated `deleteAccount` method to:
        *   Delete `ArticleComment`s and `ArticleClap`s made by the user.
        *   When deleting user's articles, first delete all comments and claps on those articles.
        *   When deleting user's communities, properly clean up articles (and their comments/claps) within those communities.
        *   Delete `GroupMessage`s sent by the user in any group.

## File Changes

*   `services/user-service/src/users/users.module.ts`
*   `services/user-service/src/users/users.service.ts`

## Verification

This should resolve any remaining foreign key constraint violations related to community interactions.
