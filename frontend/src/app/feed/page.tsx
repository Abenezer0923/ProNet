'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import CreatePost from '@/components/posts/CreatePost';
import PostCard from '@/components/posts/PostCard';
import Navbar from '@/components/Navbar';

export default function FeedPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [recommendedCommunities, setRecommendedCommunities] = useState<any[]>([]);
    const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const deriveUsersFromPosts = () => {
        const unique = new Map<string, any>();

        const collectAuthor = (author: any) => {
            if (!author || author.id === user?.id || unique.has(author.id)) return;
            unique.set(author.id, {
                id: author.id,
                firstName: author.firstName,
                lastName: author.lastName,
                profilePicture: author.profilePicture,
                avatar: author.avatar,
                profession: author.profession,
                username: author.username,
            });
        };

        posts.forEach((feedPost) => {
            collectAuthor(feedPost.author);
            if (feedPost.originalPost?.author) {
                collectAuthor(feedPost.originalPost.author);
            }
        });

        return Array.from(unique.values()).slice(0, 3);
    };

    const fetchRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const [communitiesRes, myCommunitiesRes, usersRes] = await Promise.all([
                api.get('/search/recommendations/communities?limit=5'),
                api.get('/communities/my'),
                api.get('/search/recommendations/users?limit=5'),
            ]);

            const myCommunityIds = new Set((myCommunitiesRes.data || []).map((c: any) => c.id));
            const communitySuggestions = (communitiesRes.data || [])
                .filter((community: any) => community && !myCommunityIds.has(community.id))
                .slice(0, 3);
            setRecommendedCommunities(communitySuggestions);

            const filteredUsers = (usersRes.data || [])
                .filter((candidate: any) => candidate && candidate.id !== user?.id)
                .slice(0, 3);

            if (filteredUsers.length > 0) {
                setRecommendedUsers(filteredUsers);
            } else {
                setRecommendedUsers(deriveUsersFromPosts());
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setRecommendedCommunities([]);
            setRecommendedUsers(deriveUsersFromPosts());
        } finally {
            setLoadingRecommendations(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPosts();
            fetchRecommendations();
        }
    }, [user]);

    useEffect(() => {
        if (user && posts.length > 0 && recommendedUsers.length === 0 && !loadingRecommendations) {
            const fallbackUsers = deriveUsersFromPosts();
            if (fallbackUsers.length > 0) {
                setRecommendedUsers(fallbackUsers);
            }
        }
    }, [user, posts, recommendedUsers.length, loadingRecommendations]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
            <Navbar />

            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Left Sidebar - Profile Summary */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                            {/* Cover Image */}
                            <div className="h-16 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 relative">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoMTJ2MTJIMzZ6bTI0IDBoMTJ2MTJINjB6TTEyIDM0aDEydjEySDF2LTEyem0yNCAwaDEydjEySDM2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                            </div>

                            <div className="px-4 pb-5">
                                <div className="relative flex justify-center -mt-10 mb-3">
                                    <div className="relative">
                                        <img
                                            src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                                            alt={user.firstName}
                                            className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                                        />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <h2
                                        className="font-semibold text-gray-900 text-base hover:underline cursor-pointer hover:text-primary-700 transition-colors"
                                        onClick={() => router.push(`/profile/${user.id}`)}
                                    >
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-gray-600 text-xs line-clamp-2 mt-1 px-2">{user.profession || 'Member'}</p>
                                </div>

                                <div className="border-t border-gray-100 pt-3 space-y-2">
                                    <div className="flex justify-between text-xs group cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                        <span className="text-gray-600 group-hover:text-gray-900 font-medium">Profile views</span>
                                        <span className="font-semibold text-primary-600">128</span>
                                    </div>
                                    <div className="flex justify-between text-xs group cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                        <span className="text-gray-600 group-hover:text-gray-900 font-medium">Connections</span>
                                        <span className="font-semibold text-primary-600">45</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-3 mt-3">
                                    <button
                                        onClick={() => router.push(`/profile/${user.id}`)}
                                        className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>View Profile</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-6">
                        <CreatePost onPostCreated={fetchPosts} />

                        {loading ? (
                            <div className="space-y-4 sm:space-y-5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 animate-pulse border border-gray-200">
                                        <div className="flex space-x-3 sm:space-x-4">
                                            <div className="rounded-full bg-gray-200 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2 py-1 min-w-0">
                                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                                                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                        <div className="h-40 sm:h-48 bg-gray-200 rounded-lg mt-3 sm:mt-4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 sm:p-5 rounded-lg sm:rounded-xl text-center border border-red-200">
                                <p className="text-sm sm:text-base">{error}</p>
                                <button
                                    onClick={fetchPosts}
                                    className="mt-3 text-sm font-semibold underline hover:text-red-800 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center text-gray-500 border border-gray-200">
                                <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-base sm:text-lg font-semibold mb-2 text-gray-900">No posts yet</p>
                                <p className="text-sm sm:text-base">Be the first to share something with your network!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-5">
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPostUpdated={fetchPosts}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Recommendations */}
                    <div className="lg:hidden space-y-4 sm:space-y-5 pb-6 sm:pb-8">
                        {/* Find People Card - Mobile */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Find People</h3>
                                <Link href="/discover" className="text-xs sm:text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                                    See all
                                </Link>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4">Grow your network by connecting with professionals</p>
                            <Link
                                href="/discover"
                                className="block w-full text-center px-4 py-2.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-semibold text-sm border border-primary-200"
                            >
                                Discover People
                            </Link>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Communities for you</h3>
                                <Link href="/communities" className="text-xs sm:text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                                    See all
                                </Link>
                            </div>
                            {loadingRecommendations ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2 min-w-0">
                                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recommendedCommunities.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {recommendedCommunities.map((community) => (
                                        <div key={community.id} className="flex items-center justify-between group">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/communities/${community.id}`)}>
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center flex-shrink-0 font-bold text-primary-700 text-sm sm:text-base border border-primary-200 group-hover:border-primary-300 transition-colors">
                                                    {community.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{community.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500">{community.memberCount || 0} members</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/communities/${community.id}`)}
                                                className="ml-2 p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all flex-shrink-0"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-gray-500 italic text-center py-2">No recommendations available</p>
                            )}
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">People to follow</h3>
                                <Link href="/discover" className="text-xs sm:text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                                    See all
                                </Link>
                            </div>
                            {loadingRecommendations ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                                            <div className="flex-1 space-y-2 min-w-0">
                                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recommendedUsers.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {recommendedUsers.map((recommendedUser) => (
                                        <div key={recommendedUser.id} className="flex items-center justify-between group">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={() => router.push(recommendedUser.username ? `/in/${recommendedUser.username}` : `/profile/${recommendedUser.id}`)}>
                                                <img
                                                    src={recommendedUser.profilePicture || recommendedUser.avatar || `https://ui-avatars.com/api/?name=${recommendedUser.firstName}+${recommendedUser.lastName}`}
                                                    alt={recommendedUser.firstName}
                                                    className="h-10 w-10 sm:h-12 sm:h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                                                        {recommendedUser.firstName} {recommendedUser.lastName}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{recommendedUser.profession || 'Member'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(recommendedUser.username ? `/in/${recommendedUser.username}` : `/profile/${recommendedUser.id}`)}
                                                className="ml-2 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors border border-primary-200 hover:border-primary-300 flex-shrink-0"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-gray-500 italic text-center py-2">No recommendations available</p>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Recommendations */}
                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        {/* Find People Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm">Find People</h3>
                                <Link href="/discover" className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                    See all
                                </Link>
                            </div>
                            <p className="text-xs text-gray-600 mb-4">Grow your network by connecting with professionals</p>
                            <Link
                                href="/discover"
                                className="block w-full text-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-semibold text-sm border border-primary-200"
                            >
                                Discover People
                            </Link>
                        </div>

                        {/* Recommendations Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20 space-y-5">
                            {/* Communities Recommendations */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">Communities for you</h3>
                                    <Link href="/communities" className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                        See all
                                    </Link>
                                </div>
                                {loadingRecommendations ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-center space-x-3 animate-pulse">
                                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendedCommunities.length > 0 ? (
                                    <div className="space-y-3">
                                        {recommendedCommunities.map((community) => (
                                            <div key={community.id} className="flex items-center justify-between group">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/communities/${community.id}`)}>
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center flex-shrink-0 font-bold text-primary-700 text-sm border border-primary-200 group-hover:border-primary-300 transition-colors">
                                                        {community.name[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{community.name}</p>
                                                        <p className="text-xs text-gray-500">{community.memberCount || 0} members</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/communities/${community.id}`)}
                                                    className="ml-2 p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all flex-shrink-0"
                                                    title="Join Community"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic text-center py-2">No recommendations available</p>
                                )}
                            </div>

                            {/* User Recommendations */}
                            <div className="pt-5 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">People to follow</h3>
                                    <Link href="/discover" className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                                        See all
                                    </Link>
                                </div>
                                {loadingRecommendations ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-center space-x-3 animate-pulse">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendedUsers.length > 0 ? (
                                    <div className="space-y-3">
                                        {recommendedUsers.map((recommendedUser) => (
                                            <div key={recommendedUser.id} className="flex items-center justify-between group">
                                                <div
                                                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => router.push(recommendedUser.username ? `/in/${recommendedUser.username}` : `/profile/${recommendedUser.id}`)}
                                                >
                                                    <img
                                                        src={recommendedUser.profilePicture || recommendedUser.avatar || `https://ui-avatars.com/api/?name=${recommendedUser.firstName}+${recommendedUser.lastName}`}
                                                        alt={recommendedUser.firstName}
                                                        className="h-10 w-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                                                            {recommendedUser.firstName} {recommendedUser.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{recommendedUser.profession || 'Member'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.push(recommendedUser.username ? `/in/${recommendedUser.username}` : `/profile/${recommendedUser.id}`)}
                                                    className="ml-2 px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors border border-primary-200 hover:border-primary-300 flex-shrink-0"
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic text-center py-2">No recommendations available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
