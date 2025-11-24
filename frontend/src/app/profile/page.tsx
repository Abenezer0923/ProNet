'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { PersonalProfile } from '@/components/profile/PersonalProfile';
import { OrganizationalProfile } from '@/components/profile/OrganizationalProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/connections/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingProfile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.put('/users/profile', { profilePicture: response.data.url });
      await fetchProfile();
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.put('/users/profile', { coverPhoto: response.data.url });
      await fetchProfile();
    } catch (error: any) {
      console.error('Error uploading cover photo:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data, including posts, connections, and messages. Continue?')) {
      return;
    }

    try {
      await api.delete('/users/account');
      alert('Your account has been deleted successfully.');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                <Link href="/dashboard" className="px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition">Home</Link>
                <Link href="/connections" className="px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition">My Network</Link>
                <Link href="/communities" className="px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition">Communities</Link>
                <Link href="/chat" className="px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition">Messaging</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile/edit"
                className="hidden sm:block px-4 py-2 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 font-semibold transition text-sm"
              >
                Edit Profile
              </Link>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {isOrg ? displayName[0] : profile.firstName[0]}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative group">
            {profile.coverPhoto && (
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>

            {/* Cover Photo Upload Button */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition duration-300">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg hover:bg-white transition transform hover:scale-105">
                  {uploadingCover ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  )}
                  <span className="text-sm font-semibold text-gray-700">Edit cover</span>
                </div>
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                className="hidden"
                disabled={uploadingCover}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16 sm:-mt-20 relative mb-4">
              {/* Profile Picture */}
              <div className="relative group mx-auto sm:mx-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative">
                  {profile.profilePicture || profile.avatar ? (
                    <img
                      src={profile.profilePicture || profile.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                      {isOrg ? displayName[0] : `${profile.firstName[0]}${profile.lastName[0]}`}
                    </div>
                  )}

                  {/* Profile Picture Upload Overlay */}
                  <label htmlFor="profile-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition cursor-pointer flex items-center justify-center">
                    {uploadingProfile ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    )}
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingProfile}
                  />
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
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700 mr-1">{stats.followers + stats.following}</span> connections
                  </span>
                  {isOrg && (
                    <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                      Organization
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-3 sm:mb-2">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow">
                  {isOrg ? 'Visit Website' : 'Open to work'}
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition">
                  More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">About</h2>
            <Link href="/profile/edit" className="text-gray-400 hover:text-indigo-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
          </div>
          {profile.bio ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">
              {isOrg ? 'Add a description about your organization.' : 'Write a summary to highlight your personality and work experience.'}
            </p>
          )}
        </div>

        {/* Conditional Profile Content */}
        {isOrg ? (
          <OrganizationalProfile profile={profile} />
        ) : (
          <PersonalProfile profile={profile} />
        )}

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Permanently delete your account and all of your content.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
