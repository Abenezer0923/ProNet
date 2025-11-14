'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type SearchType = 'all' | 'users' | 'communities' | 'posts';

function SearchContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<SearchType>((searchParams.get('type') as SearchType) || 'all');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);

  const performSearch = useCallback(async (searchQuery: string, searchType: SearchType) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/search/global`, {
        params: { q: searchQuery, type: searchType },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(null);
      return;
    }

    try {
      const response = await api.get(`/search/suggestions`, {
        params: { q: searchQuery },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('type') as SearchType;
    if (q) {
      setQuery(q);
      setType(t || 'all');
      performSearch(q, t || 'all');
    }
  }, [searchParams, performSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        getSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, getSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    setType(newType);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${newType}`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for people, communities, or posts..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Suggestions Dropdown */}
          {suggestions && query.length >= 2 && !results && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
              {suggestions.users.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">USERS</div>
                  {suggestions.users.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded"
                    >
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <span className="text-sm">{user.firstName} {user.lastName}</span>
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.communities.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">COMMUNITIES</div>
                  {suggestions.communities.map((community: any) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center text-primary-600 text-sm font-semibold">
                        {community.name[0]}
                      </div>
                      <span className="text-sm">{community.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Type Filters */}
        <div className="flex gap-2 mt-4">
          {(['all', 'users', 'communities', 'posts'] as SearchType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-6">
          {/* Users */}
          {(type === 'all' || type === 'users') && results.users?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <div className="space-y-3">
                {results.users.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                        {user.bio && <p className="text-gray-600 text-sm line-clamp-2">{user.bio}</p>}
                        {user.location && <p className="text-gray-500 text-sm mt-1">📍 {user.location}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {(type === 'all' || type === 'communities') && results.communities?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Communities</h2>
              <div className="space-y-3">
                {results.communities.map((community: any) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.id}`}
                    className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {community.coverImage ? (
                      <img src={community.coverImage} alt="" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{community.name}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{community.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{community.memberCount || 0} members</span>
                        {community.category && <span>• {community.category}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {(type === 'all' || type === 'posts') && results.posts?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Posts</h2>
              <div className="space-y-3">
                {results.posts.map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {post.author.profilePicture ? (
                        <img src={post.author.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm">
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </div>
                      )}
                      <div>
                        <Link href={`/profile/${post.author.id}`} className="font-semibold hover:text-primary-600">
                          {post.author.firstName} {post.author.lastName}
                        </Link>
                        {post.community && (
                          <Link href={`/communities/${post.community.id}`} className="text-sm text-gray-600 hover:text-primary-600">
                            {' '}→ {post.community.name}
                          </Link>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="mt-3 rounded-lg max-h-96 object-cover" />
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>❤️ {post.likeCount || 0}</span>
                      <span>💬 {post.commentCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.users?.length === 0 && results.communities?.length === 0 && results.posts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No results found for "{query}"</p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
