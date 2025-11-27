'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { user: currentUser, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [profileStats, setProfileStats] = useState({ followers: 0, following: 0 });

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push('/login');
        } else if (currentUser && userId) {
            // If viewing own profile, redirect to username-based URL
            if (userId === currentUser.id) {
                if (currentUser.username) {
                    router.push(`/in/${currentUser.username}`);
                } else {
                    router.push('/profile');
                }
                return;
            }
            fetchProfile();
            checkFollowing();
            fetchProfileStats();
        }
    }, [currentUser, authLoading, userId, router]);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/users/profile/${userId}`);
            setProfile(response.data);

            // Redirect to username-based URL if username exists
            if (response.data.username) {
                router.replace(`/in/${response.data.username}`);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowing = async () => {
        try {
            const response = await api.get(`/users/connections/is-following/${userId}`);
            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error('Error checking following status:', error);
        }
    };

    const fetchProfileStats = async () => {
        try {
            const response = await api.get(`/users/connections/stats/${userId}`);
            setProfileStats(response.data);
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        }
    };

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.delete(`/users/unfollow/${userId}`);
                setIsFollowing(false);
                setProfileStats({ ...profileStats, followers: profileStats.followers - 1 });
            } else {
                await api.post(`/users/follow/${userId}`);
                setIsFollowing(true);
                setProfileStats({ ...profileStats, followers: profileStats.followers + 1 });
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('Failed to update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-gray-900">ProNet</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={currentUser?.username ? `/in/${currentUser.username}` : '/profile'}
                                className="text-gray-700 hover:text-gray-900"
                            >
                                My Profile
                            </Link>
                            <Link
                                href={`/chat?userId=${userId}`}
                                className="px-6 py-2 bg-white text-primary-600 border border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
                            >
                                Message
                            </Link>
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${isFollowing
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-primary-600 text-white hover:bg-primary-700'
                                    }`}
                            >
                                {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                    <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            {profile.profession && (
                                <p className="text-lg text-gray-600 mb-2">{profile.profession}</p>
                            )}
                            <p className="text-gray-500">{profile.email}</p>
                            {profile.location && (
                                <p className="text-gray-500 mt-1">📍 {profile.location}</p>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 mt-1 inline-block"
                                >
                                    🔗 {profile.website}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-8">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{profileStats.followers}</p>
                            <p className="text-sm text-gray-600">Followers</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{profileStats.following}</p>
                            <p className="text-sm text-gray-600">Following</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-600">Posts</p>
                        </div>
                    </div>

                    {profile.bio && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                            <p className="text-gray-700">{profile.bio}</p>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                    {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: any) => (
                                <span
                                    key={skill.id}
                                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                                >
                                    {skill.skillName}
                                    {skill.proficiencyLevel && (
                                        <span className="ml-2 text-primary-600">
                                            • {skill.proficiencyLevel}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No skills added yet</p>
                    )}
                </div>
            </main>
        </div>
    );
}
