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

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

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
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=5e372b&color=fff`}
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Recommended for you</h3>
                            <div className="space-y-4">
                                {/* Placeholder recommendations */}
                                <div className="flex items-start space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Tech Enthusiasts</p>
                                        <p className="text-xs text-gray-500">Community • 12k members</p>
                                        <button className="text-primary-700 text-xs font-medium mt-1 hover:underline transition-smooth">
                                            + Join
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                                        <p className="text-xs text-gray-500">Product Designer</p>
                                        <button className="text-primary-700 text-xs font-medium mt-1 hover:underline transition-smooth">
                                            + Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
