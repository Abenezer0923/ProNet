'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function ConnectionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchConnections();
    }
  }, [user, authLoading, router]);

  const fetchConnections = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        api.get('/users/followers'),
        api.get('/users/following'),
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const displayList = activeTab === 'followers' ? followers : following;

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
            <Link
              href={user?.username ? `/in/${user.username}` : '/profile'}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Connections</h1>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition ${activeTab === 'followers'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition ${activeTab === 'following'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Following ({following.length})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-6">
            {displayList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {activeTab === 'followers'
                    ? 'No followers yet'
                    : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayList.map((person: any) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Link href={`/profile/${person.id}`} className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {person.firstName[0]}{person.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {person.firstName} {person.lastName}
                        </h3>
                        {person.profession && (
                          <p className="text-sm text-gray-600">{person.profession}</p>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await api.post('/chat/conversations', { participantId: person.id });
                          router.push('/chat');
                        } catch (error) {
                          console.error('Error creating conversation:', error);
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
