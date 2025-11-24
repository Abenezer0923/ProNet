import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ArrowPathRoundedSquareIcon,
    ShareIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
    id: string;
    content: string;
    images?: string[];
    video?: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        profession?: string;
    };
    createdAt: string;
    likeCount: number;
    commentCount: number;
    repostCount: number;
    isRepost: boolean;
    originalPost?: Post;
    likes: any[];
}

interface PostCardProps {
    post: Post;
    onPostUpdated?: () => void;
}

const REACTION_TYPES = {
    LIKE: { icon: '👍', label: 'Like', color: 'text-blue-600' },
    CELEBRATE: { icon: '👏', label: 'Celebrate', color: 'text-green-600' },
    SUPPORT: { icon: '🤝', label: 'Support', color: 'text-purple-600' },
    INSIGHTFUL: { icon: '💡', label: 'Insightful', color: 'text-yellow-600' },
    FUNNY: { icon: '😂', label: 'Funny', color: 'text-orange-600' },
};

export default function PostCard({ post, onPostUpdated }: PostCardProps) {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasLiked = post.likes?.some(like => like.userId === user?.id);
    const userReaction = post.likes?.find(like => like.userId === user?.id)?.reactionType || 'LIKE';

    const handleLike = async (reactionType = 'LIKE') => {
        try {
            if (hasLiked && userReaction === reactionType) {
                await api.delete(`/posts/${post.id}/unlike`);
            } else {
                await api.post(`/posts/${post.id}/like`, { reactionType });
            }
            if (onPostUpdated) onPostUpdated();
            setShowReactionPicker(false);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleRepost = async () => {
        if (!confirm('Repost this to your feed?')) return;
        try {
            await api.post(`/posts/${post.id}/repost`);
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error('Error reposting:', error);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/posts/${post.id}/comments`, { content: commentContent });
            setCommentContent('');
            setShowComments(true);
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error('Error commenting:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayPost = post.isRepost && post.originalPost ? post.originalPost : post;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow">
            {post.isRepost && (
                <div className="flex items-center text-gray-500 text-sm mb-3 pb-2 border-b border-gray-50">
                    <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">{post.author.firstName} reposted this</span>
                </div>
            )}

            <div className="flex items-start space-x-3">
                <img
                    src={displayPost.author.avatar || `https://ui-avatars.com/api/?name=${displayPost.author.firstName}+${displayPost.author.lastName}`}
                    alt={displayPost.author.firstName}
                    className="h-12 w-12 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                                {displayPost.author.firstName} {displayPost.author.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{displayPost.author.profession || 'Member'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-50">
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {displayPost.content}
                    </div>

                    {displayPost.images && displayPost.images.length > 0 && (
                        <div className={`mt-3 grid gap-2 ${displayPost.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {displayPost.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Post content"
                                    className="rounded-lg w-full h-64 object-cover border border-gray-100"
                                />
                            ))}
                        </div>
                    )}

                    {displayPost.video && (
                        <div className="mt-3">
                            <video
                                src={displayPost.video}
                                controls
                                className="rounded-lg w-full max-h-96 bg-black"
                            />
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="relative">
                            <button
                                className={`flex items-center space-x-2 px-2 py-1 rounded-lg transition-colors ${hasLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                onMouseEnter={() => setShowReactionPicker(true)}
                                onClick={() => handleLike()}
                            >
                                {hasLiked ? (
                                    <span className="text-lg">{REACTION_TYPES[userReaction as keyof typeof REACTION_TYPES].icon}</span>
                                ) : (
                                    <HeartIcon className="h-5 w-5" />
                                )}
                                <span className="font-medium">{post.likeCount > 0 ? post.likeCount : 'Like'}</span>
                            </button>

                            {showReactionPicker && (
                                <div
                                    className="absolute bottom-full left-0 mb-2 bg-white shadow-xl rounded-full p-2 flex space-x-2 border border-gray-100 animate-in fade-in slide-in-from-bottom-2"
                                    onMouseLeave={() => setShowReactionPicker(false)}
                                >
                                    {Object.entries(REACTION_TYPES).map(([type, { icon, label }]) => (
                                        <button
                                            key={type}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(type);
                                            }}
                                            className="hover:scale-125 transition-transform p-1 text-2xl"
                                            title={label}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span className="font-medium">{post.commentCount > 0 ? post.commentCount : 'Comment'}</span>
                        </button>

                        <button
                            onClick={handleRepost}
                            className="flex items-center space-x-2 text-gray-500 hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            <ArrowPathRoundedSquareIcon className="h-5 w-5" />
                            <span className="font-medium">{post.repostCount > 0 ? post.repostCount : 'Repost'}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                            <ShareIcon className="h-5 w-5" />
                            <span className="font-medium">Share</span>
                        </button>
                    </div>

                    {showComments && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <form onSubmit={handleComment} className="flex space-x-3">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                                    alt="Your avatar"
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </form>
                            {/* Comments list would go here - for now just a placeholder or fetch logic */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
