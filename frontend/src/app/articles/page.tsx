'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

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
  createdAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/articles/public`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (content: string, maxLength: number = 200) => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/articles" className="text-sm font-medium text-primary-800 transition-smooth">Articles</Link>
              <Link href="/communities" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">Communities</Link>
              <Link href="/about" className="text-sm font-medium text-stone-600 hover:text-primary-800 transition-smooth">About</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/feed" className="text-sm font-semibold text-white bg-primary-800 px-5 py-2.5 rounded-lg hover:bg-primary-900 transition-smooth shadow-md hover:shadow-lg">
                Go to Feed
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-stone-700 hover:text-primary-900 px-4 py-2 rounded-lg hover:bg-primary-50 transition-smooth">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-primary-800 px-5 py-2.5 rounded-lg hover:bg-primary-900 transition-smooth shadow-md hover:shadow-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Articles</h1>
          <p className="text-xl text-primary-100 leading-relaxed">
            Explore insights, knowledge, and expertise shared by professionals across industries
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No articles yet</h3>
              <p className="text-stone-600 mb-6">Be the first to share your knowledge with the community</p>
              {user && (
                <Link href="/communities" className="inline-flex items-center px-6 py-3 bg-primary-800 text-white font-semibold rounded-lg hover:bg-primary-900 transition-smooth">
                  Join a Community
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {article.author.firstName[0]}{article.author.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {article.author.firstName} {article.author.lastName}
                        </p>
                        <p className="text-xs text-stone-500 truncate">
                          {article.community.name}
                        </p>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-stone-900 mb-3 line-clamp-2">
                      {article.title}
                    </h2>

                    <p className="text-stone-600 text-sm mb-4 line-clamp-3">
                      {getExcerpt(article.content)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                          </svg>
                          {article.clapsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {article.commentsCount}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>

                    <Link 
                      href={`/communities/${article.community.id}/articles/${article.id}`}
                      className="mt-4 block w-full text-center px-4 py-2 bg-primary-50 text-primary-800 font-semibold rounded-lg hover:bg-primary-100 transition-smooth"
                    >
                      Read Article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!user && articles.length > 0 && (
            <div className="mt-16 text-center bg-white rounded-2xl p-12 border border-stone-200">
              <h3 className="text-2xl font-bold text-stone-900 mb-4">Want to read more?</h3>
              <p className="text-stone-600 mb-6">
                Join ProNet to access full articles, engage with authors, and share your own insights
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-4 bg-primary-800 text-white font-bold rounded-xl hover:bg-primary-900 transition-smooth shadow-lg"
              >
                Create Free Account
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Logo className="mb-6" size="md" />
              <p className="text-sm">
                Empowering professionals to connect, grow, and succeed together.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="/communities" className="hover:text-white transition-colors">Communities</Link></li>
                <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center text-sm">
            &copy; {new Date().getFullYear()} ProNet Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
