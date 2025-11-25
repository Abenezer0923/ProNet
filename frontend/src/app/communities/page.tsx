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
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  privacy: string;
  isMember?: boolean;
  coverImage?: string;
  logo?: string;
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
    e.preventDefault();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                P
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ProNet
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/communities/my"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                My Communities
              </Link>
              <Link
                href="/communities/create"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                <PlusIcon className="w-5 h-5" />
                Create Community
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTM0aDEydjEySDF2LTEyem0yNCAwaDEydjEySDM2em0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Discover Amazing Communities</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Connect, Learn & Grow Together
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join vibrant communities of professionals, share knowledge, and build meaningful connections
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-2xl">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 font-medium cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{communities.length}</div>
                <div className="text-white/80 text-sm">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">
                  {communities.reduce((sum, c) => sum + (c.memberCount || 0), 0)}
                </div>
                <div className="text-white/80 text-sm">Members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{categories.length - 1}</div>
                <div className="text-white/80 text-sm">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <UserGroupIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-8 text-lg">Try adjusting your search or create a new community.</p>
            <Link
              href="/communities/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-lg"
            >
              <PlusIcon className="w-6 h-6" />
              Create Community
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Communities' : `${selectedCategory} Communities`}
              </h2>
              <div className="text-sm text-gray-500">
                {filteredCommunities.length} {filteredCommunities.length === 1 ? 'community' : 'communities'}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Cover Image with Gradient Overlay */}
                  <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                    {community.coverImage && (
                      <img
                        src={community.coverImage}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 group-hover:from-indigo-600/90 group-hover:to-purple-600/90 transition-all duration-300"></div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full capitalize shadow-lg">
                        {community.category}
                      </span>
                    </div>

                    {/* Member Badge */}
                    {community.isMember && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          Joined
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Logo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 -mt-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                        {community.logo ? (
                          <img src={community.logo} alt={community.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          community.name[0]
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {community.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                      {community.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center text-sm text-gray-500 font-medium">
                        <UsersIcon className="w-4 h-4 mr-1.5 text-indigo-500" />
                        {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                      </div>

                      {!community.isMember && (
                        <button
                          onClick={(e) => handleJoin(e, community.id)}
                          className="text-sm font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 px-4 py-2 rounded-lg transition-all duration-200 border border-indigo-200 hover:border-indigo-600"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
