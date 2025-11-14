'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

function DiscoverContent() {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      const [usersRes, communitiesRes] = await Promise.all([
        api.get('/search/recommendations/users?limit=10'),
        api.get('/search/recommendations/communities?limit=10'),
      ]);
      setRecommendedUsers(usersRes.data);
      setRecommendedCommunities(communitiesRes.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Discover</h1>

      {/* Recommended Users */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">People You May Know</h2>
          <Link href="/search?type=users" className="text-primary-600 hover:text-primary-700 font-medium">
            See all
          </Link>
        </div>

        {recommendedUsers.length === 0 ? (
          <p className="text-gray-600">No recommendations available yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedUsers.map((recommendedUser) => (
              <Link
                key={recommendedUser.id}
                href={`/profile/${recommendedUser.id}`}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  {recommendedUser.profilePicture ? (
                    <img
                      src={recommendedUser.profilePicture}
                      alt=""
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                      {recommendedUser.firstName[0]}{recommendedUser.lastName[0]}
                    </div>
                  )}
                  <h3 className="font-semibold text-lg">
                    {recommendedUser.firstName} {recommendedUser.lastName}
                  </h3>
                  {recommendedUser.bio && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{recommendedUser.bio}</p>
                  )}
                  {recommendedUser.location && (
                    <p className="text-gray-500 text-sm mt-2">📍 {recommendedUser.location}</p>
                  )}
                  {recommendedUser.skills && recommendedUser.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 justify-center">
                      {recommendedUser.skills.slice(0, 3).map((skill: any) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Communities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Communities for You</h2>
          <Link href="/search?type=communities" className="text-primary-600 hover:text-primary-700 font-medium">
            See all
          </Link>
        </div>

        {recommendedCommunities.length === 0 ? (
          <p className="text-gray-600">No recommendations available yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCommunities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {community.coverImage ? (
                  <img src={community.coverImage} alt="" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{community.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{community.memberCount || 0} members</span>
                    {community.category && <span>• {community.category}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
