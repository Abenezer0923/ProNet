'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { uploadCommunityImage } from '@/lib/upload-api';
import Image from 'next/image';

export default function CommunitySettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const communityId = params?.id as string;
  
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'groups'>('general');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [category, setCategory] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${communityId}`);
      const data = response.data;
      setCommunity(data);
      setName(data.name);
      setDescription(data.description);
      setPrivacy(data.privacy);
      setCategory(data.category || '');
      setAvatar(data.avatar || '');
      setCoverImage(data.coverImage || '');
      
      // Check if user is admin/owner
      const member = data.members?.find((m: any) => m.user.id === user?.id);
      if (!member || !['owner', 'admin'].includes(member.role)) {
        router.push(`/communities/${communityId}`);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      router.push('/communities');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadCommunityImage(file);
      setAvatar(url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadCommunityImage(file);
      setCoverImage(url);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/communities/${communityId}`, {
        name,
        description,
        privacy,
        category,
        avatar,
        coverImage,
      });
      alert('Community updated successfully');
      fetchCommunity();
    } catch (error) {
      console.error('Error updating community:', error);
      alert('Failed to update community');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/communities/${communityId}`);
      router.push('/communities');
    } catch (error) {
      console.error('Error deleting community:', error);
      alert('Failed to delete community');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await api.delete(`/communities/${communityId}/members/${userId}`);
      fetchCommunity();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/communities/${communityId}/members/${userId}/role`, { role: newRole });
      fetchCommunity();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/communities/${communityId}`)}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Community
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Community Settings</h1>
          <p className="text-gray-600 mt-2">{community.name}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'general', label: 'General' },
                { id: 'members', label: 'Members' },
                { id: 'groups', label: 'Groups' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSave} className="space-y-8">
                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Cover Image
                  </label>
                  <div className="relative group">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          {uploadingCover ? 'Uploading...' : 'Change Cover'}
                        </button>
                      </div>
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended: 1200x300px. Max file size: 5MB
                  </p>
                </div>

                {/* Avatar Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Community Avatar
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-white">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="text-white text-sm font-medium"
                        >
                          {uploadingAvatar ? '...' : 'Edit'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Upload New Avatar'}
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        Square image, at least 200x200px
                      </p>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Community Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Enter community name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                      placeholder="Describe your community..."
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {description.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="">Select a category</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Privacy
                    </label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="public">🌍 Public - Anyone can join</option>
                      <option value="private">🔒 Private - Invite only</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleDeleteCommunity}
                    className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Delete Community
                  </button>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push(`/communities/${communityId}`)}
                      className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Members Management */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Manage Members</h3>
                  <span className="text-sm text-gray-500">
                    {community.members?.length || 0} members
                  </span>
                </div>

                <div className="space-y-3">
                  {community.members?.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                          {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {member.user?.firstName} {member.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{member.user?.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                          disabled={member.role === 'owner'}
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          {member.role === 'owner' && <option value="owner">Owner</option>}
                        </select>

                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups Management */}
            {activeTab === 'groups' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Manage Groups</h3>
                  <span className="text-sm text-gray-500">
                    {community.groups?.length || 0} groups
                  </span>
                </div>

                <div className="space-y-3">
                  {community.groups?.map((group: any) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {group.type === 'announcement' ? '📢' : 
                           group.type === 'meeting' ? '🎥' :
                           group.type === 'mentorship' ? '🤝' : '💬'}
                        </span>
                        <div>
                          <div className="font-semibold">{group.name}</div>
                          <div className="text-sm text-gray-500">
                            {group.category} • {group.type}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm('Delete this group?')) {
                            try {
                              await api.delete(`/communities/groups/${group.id}`);
                              fetchCommunity();
                            } catch (error) {
                              console.error('Error deleting group:', error);
                            }
                          }
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
