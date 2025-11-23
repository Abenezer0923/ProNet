'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Article {
    id: string;
    title: string;
    content: string;
    coverImage?: string;
    author: {
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    createdAt: string;
    readingTime: number;
    clapCount: number;
    tags: string[];
}

export default function ArticlePage() {
    const params = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/communities/articles/${params.articleId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setArticle(response.data);
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.articleId) {
            fetchArticle();
        }
    }, [params.articleId]);

    if (loading) return <div className="p-8 text-center">Loading article...</div>;
    if (!article) return <div className="p-8 text-center">Article not found</div>;

    return (
        <div className="min-h-screen bg-white">
            <article className="max-w-3xl mx-auto px-4 py-12">
                <header className="mb-8 space-y-6">
                    <div className="flex items-center gap-3">
                        {article.author.profileImage ? (
                            <img
                                src={article.author.profileImage}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                        )}
                        <div>
                            <div className="font-medium text-gray-900">
                                {article.author.firstName} {article.author.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(article.createdAt))} ago · {article.readingTime} min read
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                        {article.title}
                    </h1>

                    {article.coverImage && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                            <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </header>

                <div className="prose prose-lg max-w-none text-gray-800">
                    {/* TODO: Render markdown/rich text properly */}
                    <div className="whitespace-pre-wrap">{article.content}</div>
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-8">
                        {article.tags?.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                                <span className="text-2xl">👏</span>
                                <span className="font-medium">{article.clapCount}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                                <span className="text-2xl">💬</span>
                                <span className="font-medium">Comments</span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {/* Social share buttons could go here */}
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    );
}
