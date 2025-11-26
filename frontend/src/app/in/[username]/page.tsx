'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { PersonalProfile } from '@/components/profile/PersonalProfile';
import { OrganizationalProfile } from '@/components/profile/OrganizationalProfile';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    if (username) {
      fetchProfileByUsername();
    }
  }, [username, currentUser]);

  const fetchProfileByUsername = async () => {
    try {
      const response = await api.get(`/users/in/${username}`);
      setProfile(response.data);
      
      if (currentUser) {
        const isOwn = response.data.id === currentUser.id || 
                      response.data.username === currentUser.username;
        setIsOwnProfile(isOwn);
        
        if (isOwn) {
          // Redirect to /profile if viewing own profile
          router.push('/profile');
          return;
        } else {
          checkFollowStatus(response.data.id);
        }
      }
      
      try {
        const statsResponse = await api.get(`/users/connections/stats/${response.data.id}`);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      try {
        const communitiesResponse = await api.get(`/communities/creator/${response.data.id}`);
        setCommunities(communitiesResponse.data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const response = await api.get(`/users/connections/is-following/${userId}`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/users/unfollow/${profile.id}`);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await api.post(`/users/follow/${profile.id}`);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isOrg = profile.profileType === 'organizational';
  const displayName = isOrg ? profile.organizationName : `${profile.firstName} ${profile.lastName}`;
  const displaySubtitle = isOrg ? 'Organization' : profile.profession;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Logo size="sm" />
              </Link>
              <div className="hidden md:flex space-x-1">
                <Link href="/dashboard" className="px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md font-medium transition-smooth">Home</Link>
                <Link href="/connections" className="px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md font-medium transition-smooth">My Network</Link>
                <Link href="/communities" className="px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md font-medium transition-smooth">Communities</Link>
                <Link href="/chat" className="px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md font-medium transition-smooth">Messaging</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <Link href="/profile" className="flex flex-col items-center group">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 group-hover:ring-2 group-hover:ring-primary-200 transition">
                    {currentUser.firstName?.[0] || 'U'}
                  </div>
                  <span className="hidden md:block text-[11px] text-gray-500 mt-1 group-hover:text-primary-800">Me</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-primary-700 via-primary-600 to-amber-600 relative">
            {profile.coverPhoto && (
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 mt-4 sm:-mt-16 lg:-mt-20 relative mb-4">
              {/* Profile Picture */}
              <div className="relative mx-auto sm:mx-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  {profile.profilePicture || profile.avatar ? (
                    <img
                      src={profile.profilePicture || profile.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center text-primary-700 text-4xl font-bold">
                      {isOrg ? displayName[0] : `${profile.firstName[0]}${profile.lastName[0]}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Title */}
              <div className="mt-4 sm:mt-0 flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {displayName}
                </h1>
                {displaySubtitle && (
                  <p className="text-lg text-gray-600 mt-1 font-medium">{displaySubtitle}</p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500">
                  {profile.location && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700 mr-3">{stats.followers} Followers</span>
                    <span className="font-semibold text-gray-700">{stats.following} Following</span>
                  </span>
                  {isOrg && (
                    <span className="flex items-center text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                      Organization
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-3 sm:mb-2">
                {currentUser ? (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-full font-semibold transition shadow-sm hover:shadow ${
                        isFollowing
                          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-primary-700 text-white hover:bg-primary-800'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link
                      href={`/chat?user=${profile.id}`}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition"
                    >
                      Message
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-primary-700 text-white rounded-full hover:bg-primary-800 font-semibold transition shadow-sm hover:shadow"
                  >
                    Follow
                  </Link>
                )}
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition">
                  More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          {profile.bio ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio added yet.</p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity/Feed Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity</h2>
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">No recent activity</p>
                <p className="text-sm">Posts and activity will be displayed here</p>
              </div>
            </div>

            {profile.profileType === 'personal' ? (
              <PersonalProfile profile={profile} />
            ) : (
              <OrganizationalProfile profile={profile} />
            )}

            {/* Communities Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Communities</h2>
              {communities.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {communities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold">
                          {community.name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{community.name}</h3>
                          <p className="text-xs text-gray-500">{community.memberCount} members</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No communities yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
              <div className="space-y-3 text-sm">
                {profile.email && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profile.email}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
