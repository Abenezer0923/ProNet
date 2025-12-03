'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';
import {
  ArrowLeftIcon,
  HandThumbUpIcon as HandThumbUpIconSolid,
  ChatBubbleLeftIcon,
  ShareIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import { HandThumbUpIcon, ChatBubbleLeftIcon as ChatBubbleLeftIconOutline } from '@heroicons/react/24/outline';

interface Article {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    username?: string;
    profilePicture?: string;
  };
  community: {
    id: number;
    name: string;
  };
  clapsCount: number;
  commentsCount: number;
  readingTime: number;
  createdAt: string;
  publishedAt: string;
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const communityId = params?.id as string;
  const articleId = params?.articleId as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [hasClapped, setHasClapped] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/articles/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/articles/${articleId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleClap = async () => {
    if (!user) {
      router.push(`/login?redirect=/communities/${communityId}/articles/${articleId}`);
      return;
    }

    try {
      await api.post(`/communities/articles/${articleId}/clap`);
      setHasClapped(true);
      if (article) {
        setArticle({ ...article, clapsCount: article.clapsCount + 1 });
      }
    } catch (error) {
      console.error('Error clapping:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push(`/login?redirect=/communities/${communityId}/articles/${articleId}`);
      return;
    }

    if (!newComment.trim()) return;

    try {
      await api.post(`/communities/articles/${articleId}/comments`, {
        content: newComment
      });
      setNewComment('');
      fetchComments();
      if (article) {
        setArticle({ ...article, commentsCount: article.commentsCount + 1 });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Article not found</h2>
          <Link href="/articles" className="text-primary-800 hover:underline">
            Back to articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <Link 
              href={`/communities/${communityId}`}
              className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to {article.community.name}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/feed" className="text-sm font-semibold text-white bg-primary-800 px-5 py-2.5 rounded-lg hover:bg-primary-900 transition-smooth shadow-md">
                Go to Feed
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-stone-700 hover:text-primary-900 px-4 py-2 rounded-lg hover:bg-primary-50 transition-smooth">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-primary-800 px-5 py-2.5 rounded-lg hover:bg-primary-900 transition-smooth shadow-md">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Article Header */}
          <div className="p-8 md:p-12 border-b border-stone-200">
            <div className="mb-6">
              <Link 
                href={`/communities/${communityId}`}
                className="inline-block px-3 py-1 bg-primary-50 text-primary-800 text-sm font-semibold rounded-full hover:bg-primary-100 transition-smooth"
              >
                {article.community.name}
              </Link>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg">
                  {article.author.firstName[0]}{article.author.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-stone-900">
                    {article.author.firstName} {article.author.lastName}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {article.readingTime} min read
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleClap}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    hasClapped 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {hasClapped ? (
                    <HandThumbUpIconSolid className="w-5 h-5" />
                  ) : (
                    <HandThumbUpIcon className="w-5 h-5" />
                  )}
                  <span className="font-semibold">{article.clapsCount}</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg">
                  <ChatBubbleLeftIconOutline className="w-5 h-5" />
                  <span className="font-semibold">{article.commentsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-primary-800 prose-strong:text-stone-900"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-6">
            Comments ({article.commentsCount})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                rows={3}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-primary-800 text-white font-semibold rounded-lg hover:bg-primary-900 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <p className="text-stone-600 mb-4">Sign in to join the conversation</p>
              <Link 
                href={`/login?redirect=/communities/${communityId}/articles/${articleId}`}
                className="inline-block px-6 py-2 bg-primary-800 text-white font-semibold rounded-lg hover:bg-primary-900 transition-smooth"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 pb-6 border-b border-stone-100 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                    {comment.author.firstName[0]}{comment.author.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-stone-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-sm text-stone-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
