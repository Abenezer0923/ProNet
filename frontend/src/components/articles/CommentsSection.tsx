'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    content: string;
    author: {
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    createdAt: string;
}

interface CommentsSectionProps {
    articleId: string;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            const response = await api.get(
                `/communities/articles/${articleId}/comments`
            );
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await api.post(
                `/communities/articles/${articleId}/comments`,
                { content: newComment }
            );
            setNewComment('');
            fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading comments...</div>;

    return (
        <div className="mt-12 max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Comments ({comments.length})
            </h3>

            <form onSubmit={handleSubmit} className="mb-10">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What are your thoughts?"
                    rows={3}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            <div className="space-y-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        {comment.author.profileImage ? (
                            <img
                                src={comment.author.profileImage}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                        )}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                    {comment.author.firstName} {comment.author.lastName}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                                </span>
                            </div>
                            <p className="text-gray-800">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
