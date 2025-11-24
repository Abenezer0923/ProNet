import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ArrowPathRoundedSquareIcon,
    ShareIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, UserGroupIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Community {
    id: string;
    name: string;
    avatar?: string;
}

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
    community?: Community;
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
        <div className="bg-gradient-to-br from-white via-white to-purple-50/20 rounded-2xl shadow-lg border-2 border-purple-100/50 p-6 mb-6 hover:shadow-xl hover:border-purple-200/70 transition-all duration-300">
            {/* Community Badge */}
            {displayPost.community && (
                <Link
                    href={`/communities/${displayPost.community.id}`}
                    className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all group"
                >
                    <UserGroupIcon className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-purple-900">
                        {displayPost.community.name}
                    </span>
                </Link>
            )}

            {post.isRepost && (
                <div className="flex items-center text-gray-600 text-sm mb-4 pb-3 border-b border-purple-100">
                    <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2 text-purple-500" />
                    <span className="font-semibold">{post.author.firstName} reposted this</span>
                </div>
            )}

            <div className="flex items-start space-x-4">
                <div className="relative">
                    <img
                        src={displayPost.author.avatar || `https://ui-avatars.com/api/?name=${displayPost.author.firstName}+${displayPost.author.lastName}`}
                        alt={displayPost.author.firstName}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-purple-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors">
                                {displayPost.author.firstName} {displayPost.author.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">{displayPost.author.profession || 'Member'}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                                <span className="mr-1">🕐</span>
                                {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <button className="text-gray-400 hover:text-purple-600 rounded-full p-2 hover:bg-purple-50 transition-all">
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                        {displayPost.content}
                    </div>

                    {displayPost.images && displayPost.images.length > 0 && (
                        <div className={`mt-4 grid gap-3 ${displayPost.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {displayPost.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Post content"
                                    className="rounded-xl w-full h-72 object-cover border-2 border-purple-100 hover:border-purple-300 transition-all"
                                />
                            ))}
                        </div>
                    )}

                    {displayPost.video && (
                        <div className="mt-4">
                            <video
                                src={displayPost.video}
                                controls
                                className="rounded-xl w-full max-h-96 bg-black border-2 border-purple-100"
                            />
                        </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t-2 border-purple-50 pt-4">
                        <div className="relative">
                            <button
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all transform hover:scale-105 ${hasLiked
                                    ? 'text-pink-600 bg-gradient-to-r from-pink-50 to-purple-50'
                                    : 'text-gray-600 hover:bg-purple-50'
                                    }`}
                                onMouseEnter={() => setShowReactionPicker(true)}
                                onClick={() => handleLike()}
                            >
                                {hasLiked ? (
                                    <span className="text-xl animate-bounce">{REACTION_TYPES[userReaction as keyof typeof REACTION_TYPES].icon}</span>
                                ) : (
                                    <HeartIcon className="h-6 w-6" />
                                )}
                                <span className="font-semibold">{post.likeCount > 0 ? post.likeCount : 'Like'}</span>
                            </button>

                            {showReactionPicker && (
                                <div
                                    className="absolute bottom-full left-0 mb-2 bg-white shadow-2xl rounded-2xl p-3 flex space-x-2 border-2 border-purple-100 animate-in fade-in slide-in-from-bottom-2"
                                    onMouseLeave={() => setShowReactionPicker(false)}
                                >
                                    {Object.entries(REACTION_TYPES).map(([type, { icon, label }]) => (
                                        <button
                                            key={type}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(type);
                                            }}
                                            className="hover:scale-125 transition-transform p-2 text-2xl rounded-full hover:bg-purple-50"
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
                            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all transform hover:scale-105"
                        >
                            <ChatBubbleLeftIcon className="h-6 w-6" />
                            <span className="font-semibold">{post.commentCount > 0 ? post.commentCount : 'Comment'}</span>
                        </button>

                        <button
                            onClick={handleRepost}
                            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-xl transition-all transform hover:scale-105"
                        >
                            <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                            <span className="font-semibold">{post.repostCount > 0 ? post.repostCount : 'Repost'}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all transform hover:scale-105">
                            <ShareIcon className="h-6 w-6" />
                            <span className="font-semibold">Share</span>
                        </button>
                    </div>

                    {showComments && (
                        <div className="mt-5 pt-5 border-t-2 border-purple-50">
                            <form onSubmit={handleComment} className="flex space-x-3">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                                    alt="Your avatar"
                                    className="h-10 w-10 rounded-full ring-2 ring-purple-100"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
