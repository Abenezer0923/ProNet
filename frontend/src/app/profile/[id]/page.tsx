'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

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

    const isOwnProfile = currentUser?.id === profile.id;
    const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` || 'P';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="h-36 sm:h-48 bg-gradient-to-r from-primary-700 via-primary-600 to-amber-600 relative">
                        {profile.coverPhoto && (
                            <img
                                src={profile.coverPhoto}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                                {profile.profilePicture || profile.avatar ? (
                                    <img
                                        src={profile.profilePicture || profile.avatar}
                                        alt={displayName || 'Profile avatar'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center text-primary-700 text-3xl font-semibold">
                                        {initials}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
                                {profile.profession && (
                                    <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">{profile.profession}</p>
                                )}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm text-gray-500">
                                    {profile.location && (
                                        <span className="flex items-center gap-2">
                                            <span role="img" aria-label="Location">📍</span>
                                            {profile.location}
                                        </span>
                                    )}
                                    {profile.email && (
                                        <span className="flex items-center gap-2 truncate">
                                            <span role="img" aria-label="Email">✉️</span>
                                            {profile.email}
                                        </span>
                                    )}
                                    {profile.website && (
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                        >
                                            <span role="img" aria-label="Website">🔗</span>
                                            {profile.website}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {!isOwnProfile && (
                                <div className="flex flex-wrap justify-center sm:justify-end gap-3">
                                    <Link
                                        href={`/messaging?userId=${userId}`}
                                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-smooth"
                                    >
                                        Message
                                    </Link>
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`px-5 py-2.5 rounded-full font-semibold transition-smooth disabled:opacity-50 ${isFollowing
                                            ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                    >
                                        {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-primary-50 rounded-xl py-4">
                                <p className="text-2xl font-bold text-primary-800">{profileStats.followers}</p>
                                <p className="text-xs uppercase tracking-wide text-primary-600">Followers</p>
                            </div>
                            <div className="bg-primary-50 rounded-xl py-4">
                                <p className="text-2xl font-bold text-primary-800">{profileStats.following}</p>
                                <p className="text-xs uppercase tracking-wide text-primary-600">Following</p>
                            </div>
                            <div className="bg-primary-50 rounded-xl py-4">
                                <p className="text-2xl font-bold text-primary-800">0</p>
                                <p className="text-xs uppercase tracking-wide text-primary-600">Posts</p>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                        {isOwnProfile && (
                            <Link href="/profile/edit" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                Manage
                            </Link>
                        )}
                    </div>
                    {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: any) => (
                                <span
                                    key={skill.id || skill.skillName}
                                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100"
                                >
                                    {skill.skillName}
                                    {skill.proficiencyLevel && (
                                        <span className="ml-2 text-primary-500">
                                            • {skill.proficiencyLevel}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No skills added yet</p>
                    )}
                </section>
            </main>
        </div>
    );
}
