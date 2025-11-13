'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && communityId) {
      fetchCommunity();
      checkMembership();
      fetchPosts();
    }
  }, [user, authLoading, communityId, router]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${communityId}`);
      setCommunity(response.data);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/is-member`);
      setIsMember(response.data.isMember);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/posts?communityId=${communityId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleJoin = async () => {
    setJoinLoading(true);
    try {
      if (isMember) {
        await api.delete(`/communities/${communityId}/leave`);
        setIsMember(false);
        if (community) {
          setCommunity({ ...community, memberCount: community.memberCount - 1 });
        }
      } else {
        await api.post(`/communities/${communityId}/join`);
        setIsMember(true);
        if (community) {
          setCommunity({ ...community, memberCount: community.memberCount + 1 });
        }
      }
    } catch (error: any) {
      console.error('Error toggling membership:', error);
      alert(error.response?.data?.message || 'Failed to update membership');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPostLoading(true);
    try {
      const response = await api.post('/posts', {
        content: newPost,
        communityId,
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setPostLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!community) return null;

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
              href="/communities"
              className="text-gray-700 hover:text-gray-900"
            >
              ← Back to Communities
            </Link>
          </div>
        </div>
      </header>

      {/* Community Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-primary-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                {community.name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {community.name}
                </h1>
                <p className="text-gray-600 mb-2">{community.category}</p>
                <p className="text-gray-700 mb-4">{community.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{community.memberCount} members</span>
                  <span>•</span>
                  <span>
                    Created by {community.creator?.firstName}{' '}
                    {community.creator?.lastName}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={joinLoading}
              className={`px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${
                isMember
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {joinLoading ? 'Loading...' : isMember ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Post */}
        {isMember && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postLoading || !newPost.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {postLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">
                {isMember
                  ? 'No posts yet. Be the first to post!'
                  : 'Join the community to see posts'}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author?.firstName?.[0]}
                    {post.author?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-1 hover:text-primary-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        <span>{post.likeCount}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{post.commentCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
