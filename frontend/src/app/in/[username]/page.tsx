'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfileByUsername();
    }
  }, [username]);

  const fetchProfileByUsername = async () => {
    try {
      const response = await api.get(`/users/in/${username}`);
      setProfile(response.data);
      
      // Check if this is the current user's profile
      if (currentUser && response.data.id === currentUser.id) {
        setIsOwnProfile(true);
      }
      
      // Fetch stats
      try {
        const statsResponse = await api.get(`/users/connections/stats/${response.data.id}`);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">ProNet</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">Home</Link>
                <Link href="/connections" className="text-gray-700 hover:text-gray-900 font-medium">My Network</Link>
                <Link href="/communities" className="text-gray-700 hover:text-gray-900 font-medium">Communities</Link>
                <Link href="/chat" className="text-gray-700 hover:text-gray-900 font-medium">Messaging</Link>
              </div>
            </div>
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 font-semibold transition"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            {profile.coverPhoto && (
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16 relative">
              {/* Profile Picture */}
              <div className="relative">
                {profile.profilePicture || profile.avatar ? (
                  <img
                    src={profile.profilePicture || profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div className="mt-4 sm:mt-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.profession && (
                  <p className="text-lg text-gray-700 mt-1">{profile.profession}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  {profile.location && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {stats.followers + stats.following} connections
                  </span>
                  {profile.username && (
                    <span className="flex items-center text-indigo-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      @{profile.username}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profile.bio && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: any) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {profile.showEmail && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Info</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>
              {profile.website && (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
