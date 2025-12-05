import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    HandThumbUpIcon as HandThumbUpIconOutline,
    ChatBubbleLeftIcon,
    ArrowPathRoundedSquareIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid, UserGroupIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Community {
    id: string;
    name: string;
    avatar?: string;
    profilePicture?: string;
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
        profilePicture?: string;
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

type ReactionType = keyof typeof REACTION_TYPES;

export default function PostCard({ post, onPostUpdated }: PostCardProps) {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [localCommentCount, setLocalCommentCount] = useState(post.commentCount || 0);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localContent, setLocalContent] = useState(post.content);
    const [commentError, setCommentError] = useState<string | null>(null);

    useEffect(() => {
        setLocalContent(post.content);
        setEditContent(post.content);
    }, [post.id, post.content]);

    const initialHasLiked = post.likes?.some(like => like.userId === user?.id) ?? false;
    const initialReaction = (post.likes?.find(like => like.userId === user?.id)?.reactionType || 'LIKE') as ReactionType;
    const [liked, setLiked] = useState(initialHasLiked);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [currentReaction, setCurrentReaction] = useState<ReactionType>(initialReaction);

    useEffect(() => {
        setLiked(initialHasLiked);
        setLikeCount(post.likeCount || 0);
        setCurrentReaction(initialReaction);
    }, [post.id, post.likeCount, post.likes, initialHasLiked, initialReaction]);

    const handleLike = async (reactionType: ReactionType = 'LIKE') => {
        const isSameReaction = liked && currentReaction === reactionType;
        const previousLiked = liked;
        const previousReaction = currentReaction;
        const previousCount = likeCount;

        if (isSameReaction) {
            setLiked(false);
            setCurrentReaction('LIKE');
            setLikeCount((count) => Math.max(0, count - 1));
        } else {
            if (!liked) {
                setLikeCount((count) => count + 1);
            }
            setLiked(true);
            setCurrentReaction(reactionType);
        }

        try {
            if (isSameReaction) {
                await api.delete(`/posts/${post.id}/unlike`);
            } else {
                await api.post(`/posts/${post.id}/like`, { reactionType });
            }
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error('Error liking post:', error);
            setLiked(previousLiked);
            setCurrentReaction(previousReaction);
            setLikeCount(previousCount);
        } finally {
            setShowReactionPicker(false);
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

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const response = await api.get(`/posts/${post.id}/comments`);
            setComments(response.data);
            setLocalCommentCount(response.data.length);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return null;
        } finally {
            setLoadingComments(false);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedContent = commentContent.trim();
        if (!trimmedContent) return;

        setIsSubmitting(true);
        const previousCount = localCommentCount;
        try {
            await api.post(`/posts/${post.id}/comments`, { content: trimmedContent });
            setCommentContent('');
            setShowComments(true);
            await fetchComments(); // Refresh comments
            if (onPostUpdated) onPostUpdated();
            setCommentError(null);
        } catch (error) {
            console.error('Error commenting:', error);
            const latestComments = await fetchComments();
            if (latestComments && latestComments.length > previousCount) {
                setCommentContent('');
                setShowComments(true);
                if (onPostUpdated) onPostUpdated();
                setCommentError(null);
            } else {
                setCommentError('Unable to post comment right now. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        setIsDeleting(true);
        try {
            await api.delete(`/posts/${post.id}`);
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async () => {
        const trimmedContent = editContent.trim();
        if (!trimmedContent) return;
        try {
            await api.put(`/posts/${post.id}`, { content: trimmedContent });
            setLocalContent(trimmedContent);
            setEditContent(trimmedContent);
            setIsEditing(false);
            if (onPostUpdated) onPostUpdated();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post');
        }
    };

    const handleToggleComments = async () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);
        if (newShowComments && comments.length === 0) {
            await fetchComments();
        }
    };

    const displayPost = post.isRepost && post.originalPost ? post.originalPost : post;
    const displayContent = post.isRepost && post.originalPost ? post.originalPost.content : localContent;

    return (
        <div className="bg-gradient-to-br from-white via-white to-purple-50/20 rounded-2xl shadow-lg border-2 border-purple-100/50 p-4 sm:p-6 mb-6 hover:shadow-xl hover:border-purple-200/70 transition-all duration-300">
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
                    <span className="font-semibold">
                        {post.author.id === user?.id ? 'You' : `${post.author.firstName} ${post.author.lastName}`} reposted this
                    </span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="relative">
                    <img
                        src={displayPost.author.profilePicture || displayPost.author.avatar || `https://ui-avatars.com/api/?name=${displayPost.author.firstName}+${displayPost.author.lastName}`}
                        alt={displayPost.author.firstName}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-purple-100"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
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
                        <div className="relative self-end sm:self-auto">
                            <button
                                onClick={() => setShowEditMenu(!showEditMenu)}
                                className="text-gray-400 hover:text-purple-600 rounded-full p-2 hover:bg-purple-50 transition-all"
                            >
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>

                            {showEditMenu && user?.id === post.author.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-purple-100 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowEditMenu(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete();
                                            setShowEditMenu(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="mt-4">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                            {displayContent}
                        </div>
                    )}

                    {displayPost.images && displayPost.images.length > 0 && (
                        <div className={`mt-4 grid gap-3 ${displayPost.images.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {displayPost.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Post content"
                                    className="rounded-xl w-full h-48 sm:h-72 object-cover border-2 border-purple-100 hover:border-purple-300 transition-all"
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

                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t-2 border-purple-50 pt-4">
                        <div className="relative w-full sm:w-auto" onMouseLeave={() => setShowReactionPicker(false)}>
                            <button
                                aria-pressed={liked}
                                className={`group flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-xl border transition-all transform hover:scale-[1.02] w-full sm:w-auto ${liked
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50/60'
                                    }`}
                                onMouseEnter={() => setShowReactionPicker(true)}
                                onClick={() => handleLike()}
                            >
                                {liked ? (
                                    currentReaction === 'LIKE' ? (
                                        <HandThumbUpIconSolid className="h-6 w-6 text-blue-600 transition-transform group-hover:scale-110" />
                                    ) : (
                                        <span className="text-xl transition-transform group-hover:scale-110" aria-hidden>{REACTION_TYPES[currentReaction].icon}</span>
                                    )
                                ) : (
                                    <HandThumbUpIconOutline className="h-6 w-6 text-gray-500 transition-transform group-hover:text-blue-600 group-hover:scale-110" />
                                )}
                                <span className={`font-semibold ${liked ? 'text-blue-600' : 'group-hover:text-blue-600'}`}>
                                    {liked ? REACTION_TYPES[currentReaction].label : 'Like'}
                                </span>
                                {likeCount > 0 && (
                                    <span className={`text-sm font-semibold ${liked ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'}`}>
                                        {likeCount}
                                    </span>
                                )}
                            </button>

                            {showReactionPicker && (
                                <div
                                    className="absolute bottom-full left-0 mb-2 bg-white shadow-2xl rounded-2xl p-3 flex space-x-2 border-2 border-purple-100 animate-in fade-in slide-in-from-bottom-2"
                                    onMouseLeave={() => setShowReactionPicker(false)}
                                >
                                    {Object.entries(REACTION_TYPES).map(([type, { icon, label }]) => {
                                        const reactionKey = type as ReactionType;
                                        return (
                                            <button
                                                key={reactionKey}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(reactionKey);
                                                }}
                                                className={`cursor-pointer transition-transform p-2 text-2xl rounded-full ${liked && currentReaction === reactionKey ? 'ring-2 ring-blue-400 bg-blue-50 scale-110' : 'hover:scale-125 hover:bg-purple-50'}`}
                                                title={label}
                                            >
                                                {icon}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleToggleComments}
                                className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all transform hover:scale-[1.02] w-full sm:w-auto"
                            >
                                <ChatBubbleLeftIcon className="h-6 w-6" />
                                <span className="font-semibold">{localCommentCount > 0 ? localCommentCount : 'Comment'}</span>
                            </button>

                            <button
                                onClick={handleRepost}
                                className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-xl transition-all transform hover:scale-[1.02] w-full sm:w-auto"
                            >
                                <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                                <span className="font-semibold">{post.repostCount > 0 ? post.repostCount : 'Repost'}</span>
                            </button>
                        </div>
                    </div>

                    {showComments && (
                        <div className="mt-5 pt-5 border-t-2 border-purple-50 space-y-4">
                            {/* Comment Count Header */}
                            {localCommentCount > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        {localCommentCount} {localCommentCount === 1 ? 'Comment' : 'Comments'}
                                    </h4>
                                </div>
                            )}

                            {/* Existing Comments */}
                            {loadingComments ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex space-x-3">
                                            <img
                                                src={comment.author?.profilePicture || comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.firstName}+${comment.author?.lastName}`}
                                                alt={comment.author?.firstName}
                                                className="h-8 w-8 rounded-full ring-2 ring-purple-100 flex-shrink-0"
                                            />
                                            <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-semibold text-sm text-gray-900">
                                                        {comment.author?.firstName} {comment.author?.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {/* Comment Input */}
                            <form onSubmit={handleComment} className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 space-y-3 sm:space-y-0">
                                <img
                                    src={user?.profilePicture || user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                                    alt="Your avatar"
                                    className="h-10 w-10 rounded-full ring-2 ring-purple-100 flex-shrink-0"
                                />
                                <div className="flex-1 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => {
                                            setCommentContent(e.target.value);
                                            if (commentError) setCommentError(null);
                                        }}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentContent.trim() || isSubmitting}
                                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition w-full sm:w-auto ${!commentContent.trim() || isSubmitting
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            'Post'
                                        )}
                                    </button>
                                </div>
                            </form>
                            {commentError && (
                                <p className="mt-2 text-sm text-red-500 pl-0 sm:pl-14">{commentError}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
