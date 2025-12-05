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
import { Logo } from '@/components/Logo';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  privacy: string;
  isMember?: boolean;
  coverImage?: string;
  avatar?: string;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchCommunities();
    }
  }, [authLoading]);

  const fetchCommunities = async () => {
    try {
      console.log('Fetching communities...');
      const response = await api.get('/communities');
      const communitiesData = response.data;

      console.log('Communities data received:', communitiesData);
      console.log('Is array?', Array.isArray(communitiesData));
      console.log('Length:', communitiesData?.length);

      // Ensure we have an array
      if (!Array.isArray(communitiesData)) {
        console.error('Communities data is not an array:', communitiesData);
        setError('Received invalid data format from server.');
        setCommunities([]);
        setLoading(false);
        return;
      }

      console.log(`Found ${communitiesData.length} communities`);

      if (communitiesData.length === 0) {
        console.warn('No communities found in database');
      }

      let enhancedCommunities = communitiesData;

      // If user is logged in, check which communities they're a member of
      if (user) {
        try {
          const myCommunitiesRes = await api.get('/communities/my');
          const myCommunityIds = new Set(myCommunitiesRes.data.map((c: any) => c.id));
          enhancedCommunities = communitiesData.map((c: any) => ({
            ...c,
            isMember: myCommunityIds.has(c.id)
          }));
        } catch (error) {
          console.error('Error fetching my communities:', error);
          // Continue with non-enhanced communities
        }
      }

      setCommunities(enhancedCommunities);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching communities:', error);
      setError(`Failed to connect to server: ${error.message}`);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!user) {
      router.push(`/login?redirect=/communities/${communityId}`);
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group flex-shrink-0">
              <Logo />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <Link
                    href="/communities/my"
                    className="hidden sm:block text-gray-600 hover:text-primary-800 font-medium transition-smooth text-sm lg:text-base"
                  >
                    My Communities
                  </Link>
                  <Link
                    href="/communities/create"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary-800 to-primary-700 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-105 transition-smooth font-medium text-xs sm:text-sm lg:text-base"
                  >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Create</span>
                    <span className="hidden sm:inline">Community</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-primary-800 font-medium transition-smooth px-2 sm:px-4 py-2 text-sm sm:text-base"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary-800 to-primary-700 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-105 transition-smooth font-medium text-xs sm:text-sm lg:text-base"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTM0aDEydjEySDF2LTEyem0yNCAwaDEydjEySDM2em0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyem0yNC0yNGgxMnYxMkg2MHptLTI0IDBoMTJ2MTJIMzZ6bS0yNCAwaDEydjEySDF2LTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Discover Amazing Communities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              Connect, Learn & Grow Together
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-4">
              Join vibrant communities of professionals, share knowledge, and build meaningful connections
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white rounded-xl sm:rounded-2xl p-2 shadow-2xl">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 w-full rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 text-gray-900 text-sm sm:text-base"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 bg-gray-50 text-gray-900 font-medium cursor-pointer text-sm sm:text-base"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{communities.length}</div>
                <div className="text-white/80 text-xs sm:text-sm">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
                  {communities.reduce((sum, c) => sum + (c.memberCount || 0), 0)}
                </div>
                <div className="text-white/80 text-xs sm:text-sm">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{categories.length - 1}</div>
                <div className="text-white/80 text-xs sm:text-sm">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-900 font-semibold mb-1 text-sm sm:text-base">Error Loading Communities</h3>
                <p className="text-red-700 text-xs sm:text-sm break-words">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchCommunities();
                  }}
                  className="mt-3 text-xs sm:text-sm font-semibold text-red-700 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredCommunities.length === 0 && !error ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 md:p-16 text-center">
            <UserGroupIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-6 sm:mb-8 text-base sm:text-lg px-4">
              {communities.length === 0
                ? "No communities have been created yet. Be the first to start one!"
                : "Try adjusting your search or create a new community."}
            </p>
            {user && (
              <Link
                href="/communities/create"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-800 to-primary-700 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:scale-105 transition-smooth font-medium text-base sm:text-lg"
              >
                <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Create Community
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Communities' : `${selectedCategory} Communities`}
              </h2>
              <div className="text-xs sm:text-sm text-gray-500">
                {filteredCommunities.length} {filteredCommunities.length === 1 ? 'community' : 'communities'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-smooth flex flex-col h-full"
                >
                  {/* Cover Image with Gradient Overlay */}
                  <div className="relative h-32 bg-gradient-to-br from-primary-700 via-primary-600 to-amber-600 overflow-hidden">
                    {community.coverImage ? (
                      <>
                        <img
                          src={community.coverImage}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:from-black/50 transition-smooth"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-800/80 to-primary-700/80"></div>
                    )}

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
                      <div className="w-16 h-16 -mt-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-primary-800 to-primary-700 text-white group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                        {community.avatar ? (
                          <img src={community.avatar} alt={community.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          community.name[0]
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-800 transition-smooth line-clamp-1">
                      {community.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                      {community.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center text-sm text-gray-500 font-medium">
                        <UsersIcon className="w-4 h-4 mr-1.5 text-primary-600" />
                        {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                      </div>

                      {!community.isMember && (
                        <button
                          onClick={(e) => handleJoin(e, community.id)}
                          className="text-sm font-semibold text-primary-700 hover:text-white hover:bg-primary-700 px-4 py-2 rounded-lg transition-smooth border border-primary-300 hover:border-primary-700"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600/0 to-amber-600/0 group-hover:from-primary-600/5 group-hover:to-amber-600/5 transition-smooth pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
