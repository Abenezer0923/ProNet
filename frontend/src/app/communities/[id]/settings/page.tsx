'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/communities/${communityId}`, {
        name,
        description,
        privacy,
        category,
      });
      alert('Community updated successfully');
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
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Technology, Business, Education"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="public">Public - Anyone can join</option>
                    <option value="private">Private - Invite only</option>
                  </select>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleDeleteCommunity}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Community
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
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
