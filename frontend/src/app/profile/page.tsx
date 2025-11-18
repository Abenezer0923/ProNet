'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingProfile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update profile with new image URL
      await api.patch('/users/profile', {
        profilePicture: response.data.url,
      });
      
      // Refresh profile
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update profile with new cover photo URL
      await api.patch('/users/profile', {
        coverPhoto: response.data.url,
      });
      
      // Refresh profile
      await fetchProfile();
    } catch (error: any) {
      console.error('Error uploading cover photo:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading || authLoading) {
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
            <Link
              href="/profile/edit"
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 font-semibold transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative group">
            {profile.coverPhoto && (
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            
            {/* Cover Photo Upload Button */}
            <div className="absolute top-4 right-4">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="bg-white rounded-lg px-4 py-2 flex items-center space-x-2 shadow-lg hover:bg-gray-50 transition opacity-0 group-hover:opacity-100">
                  {uploadingCover ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Edit cover photo</span>
                    </>
                  )}
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16 relative">
              {/* Profile Picture */}
              <div className="relative group">
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
                
                {/* Profile Picture Upload Button */}
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                    {uploadingProfile ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
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
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition">
                Open to work
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition">
                Add section
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition">
                More
              </button>
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

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Experience</h2>
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="space-y-6">
            {/* Placeholder for experience - you can add this to backend later */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{profile.profession || 'Position'}</h3>
                <p className="text-gray-600">Company Name</p>
                <p className="text-sm text-gray-500">Jan 2023 - Present · 1 yr</p>
                <p className="text-sm text-gray-500">{profile.location || 'Location'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Education</h2>
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="space-y-6">
            {/* Placeholder for education */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">University Name</h3>
                <p className="text-gray-600">Bachelor's Degree, Computer Science</p>
                <p className="text-sm text-gray-500">2019 - 2023</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Skills</h2>
            <Link href="/profile/edit" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="space-y-4">
              {profile.skills.map((skill: any) => (
                <div key={skill.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{skill.skillName}</h3>
                    {skill.proficiencyLevel && (
                      <p className="text-sm text-gray-600 mt-1">{skill.proficiencyLevel}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet. Add skills to showcase your expertise.</p>
          )}
        </div>

        {/* Communities Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Communities</h2>
            <Link href="/communities" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
              See all
            </Link>
          </div>
          <p className="text-gray-500">Join communities to connect with professionals in your field.</p>
        </div>

        {/* Contact Info */}
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

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );

  async function handleDeleteAccount() {
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
  }
}
