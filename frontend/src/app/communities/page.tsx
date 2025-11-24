'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  privacy: string;
  isMember?: boolean;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchCommunities();
    }
  }, [user, authLoading, router]);

  const fetchCommunities = async () => {
    try {
      const [communitiesRes, myCommunitiesRes] = await Promise.all([
        api.get('/communities'),
        api.get('/communities/my')
      ]);

      const myCommunityIds = new Set(myCommunitiesRes.data.map((c: any) => c.id));

      const enhancedCommunities = communitiesRes.data.map((c: any) => ({
        ...c,
        isMember: myCommunityIds.has(c.id)
      }));

      setCommunities(enhancedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    try {
      await api.post(`/communities/${communityId}/join`);
      setCommunities(prev => prev.map(c =>
        c.id === communityId
          ? { ...c, isMember: true, memberCount: (c.memberCount || 0) + 1 }
          : c
      ));
    } catch (error: any) {
      console.error('Error joining community:', error);

      // If already a member (403), update state anyway
      if (error.response && error.response.status === 403) {
        setCommunities(prev => prev.map(c =>
          c.id === communityId
            ? { ...c, isMember: true }
            : c
        ));
        return;
      }

      alert('Failed to join community');
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(communities.map(c => c.category)))];

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition">P</div>
              <span className="text-xl font-bold text-gray-900">ProNet</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/communities/my"
                className="text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                My Communities
              </Link>
              <Link
                href="/communities/create"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
              >
                <PlusIcon className="w-5 h-5" />
                Create Community
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Communities</h1>
            <p className="text-gray-600 mt-1">Find and join groups that match your interests</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or create a new community.</p>
            <Link
              href="/communities/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Create Community
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-100 transition flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xl font-bold flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                    {community.name[0]}
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                    {community.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                  {community.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {community.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 mr-1.5" />
                    {community.memberCount} members
                  </div>

                  {community.isMember ? (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      Joined
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleJoin(e, community.id)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-full transition"
                    >
                      Join Now
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
