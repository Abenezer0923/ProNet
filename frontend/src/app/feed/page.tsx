'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Profile Summary */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
                                    alt={user.firstName}
                                    className="h-20 w-20 rounded-full object-cover border-4 border-gray-50 mb-3"
                                />
                                <h2 className="font-bold text-gray-900 text-lg">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 text-sm mb-4">{user.profession || 'Member'}</p>

                                <div className="w-full border-t border-gray-100 pt-4 mt-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">Profile views</span>
                                        <span className="font-medium text-primary-700">128</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Connections</span>
                                        <span className="font-medium text-primary-700">45</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-6">
                        <CreatePost onPostCreated={fetchPosts} />

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse h-48"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                                {error}
                                <button
                                    onClick={fetchPosts}
                                    className="block mx-auto mt-2 text-sm font-medium underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                                <p className="text-lg font-medium mb-2">No posts yet</p>
                                <p>Be the first to share something with your network!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
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

                    {/* Right Sidebar - Recommendations */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24 space-y-6">
                            {/* Communities Recommendations */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Communities for you</h3>
                                {loadingRecommendations ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-start space-x-3 animate-pulse">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendedCommunities.length > 0 ? (
                                    <div className="space-y-4">
                                        {recommendedCommunities.map((community) => (
                                            <div key={community.id} className="flex items-start space-x-3">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                                                    {community.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{community.name}</p>
                                                    <p className="text-xs text-gray-500">{community.memberCount || 0} members</p>
                                                    <button
                                                        onClick={() => router.push(`/communities/${community.id}`)}
                                                        className="text-primary-700 text-xs font-medium mt-1 hover:underline transition-smooth"
                                                    >
                                                        + Join
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No recommendations available</p>
                                )}
                            </div>

                            {/* User Recommendations */}
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">People to follow</h3>
                                {loadingRecommendations ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-start space-x-3 animate-pulse">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendedUsers.length > 0 ? (
                                    <div className="space-y-4">
                                        {recommendedUsers.map((recommendedUser) => (
                                            <div key={recommendedUser.id} className="flex items-start space-x-3">
                                                <img
                                                    src={recommendedUser.profilePicture || recommendedUser.avatar || `https://ui-avatars.com/api/?name=${recommendedUser.firstName}+${recommendedUser.lastName}`}
                                                    alt={recommendedUser.firstName}
                                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {recommendedUser.firstName} {recommendedUser.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{recommendedUser.profession || 'Member'}</p>
                                                    <button
                                                        onClick={() => router.push(recommendedUser.username ? `/in/${recommendedUser.username}` : `/profile/${recommendedUser.id}`)}
                                                        className="text-primary-700 text-xs font-medium mt-1 hover:underline transition-smooth"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No recommendations available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
