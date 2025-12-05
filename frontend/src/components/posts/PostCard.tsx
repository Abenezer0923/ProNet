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
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-5 hover:shadow-md transition-all duration-200">
            {/* Community Badge */}
            {displayPost.community && (
                <Link
                    href={`/communities/${displayPost.community.id}`}
                    className="inline-flex items-center space-x-1.5 sm:space-x-2 mb-3 sm:mb-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-50 rounded-full hover:bg-primary-100 transition-all group border border-primary-200"
                >
                    <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-sm font-semibold text-primary-900">
                        {displayPost.community.name}
                    </span>
                </Link>
            )}

            {post.isRepost && (
                <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
                    <ArrowPathRoundedSquareIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-primary-500 flex-shrink-0" />
                    <span className="font-medium truncate">
                        {post.author.id === user?.id ? 'You' : `${post.author.firstName} ${post.author.lastName}`} reposted this
                    </span>
                </div>
            )}

            <div className="flex space-x-2 sm:space-x-3 md:space-x-4">
                <div className="relative flex-shrink-0">
                    <img
                        src={displayPost.author.profilePicture || displayPost.author.avatar || `https://ui-avatars.com/api/?name=${displayPost.author.firstName}+${displayPost.author.lastName}`}
                        alt={displayPost.author.firstName}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 hover:text-primary-700 cursor-pointer transition-colors text-sm sm:text-base truncate">
                                {displayPost.author.firstName} {displayPost.author.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{displayPost.author.profession || 'Member'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowEditMenu(!showEditMenu)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1 sm:p-1.5 hover:bg-gray-100 transition-all"
                            >
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>

                            {showEditMenu && user?.id === post.author.id && (
                                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowEditMenu(false);
                                        }}
                                        className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete();
                                            setShowEditMenu(false);
                                        }}
                                        className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="mt-3 sm:mt-4">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                                rows={3}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-3 py-1.5 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 sm:mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                            {displayContent}
                        </div>
                    )}

                    {displayPost.images && displayPost.images.length > 0 && (
                        <div className={`mt-3 sm:mt-4 grid gap-2 sm:gap-3 ${displayPost.images.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {displayPost.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt="Post content"
                                    className="rounded-lg sm:rounded-xl w-full h-48 sm:h-64 md:h-72 object-cover border border-gray-200"
                                />
                            ))}
                        </div>
                    )}

                    {displayPost.video && (
                        <div className="mt-3 sm:mt-4">
                            <video
                                src={displayPost.video}
                                controls
                                className="rounded-lg sm:rounded-xl w-full max-h-80 sm:max-h-96 bg-black border border-gray-200"
                            />
                        </div>
                    )}

                    <div className="mt-3 sm:mt-4 flex items-center justify-around gap-1 sm:gap-2 border-t border-gray-200 pt-2 sm:pt-3">
                        <div className="relative flex-1" onMouseLeave={() => setShowReactionPicker(false)}>
                            <button
                                aria-pressed={liked}
                                className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all w-full ${liked
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                onMouseEnter={() => setShowReactionPicker(true)}
                                onClick={() => handleLike()}
                            >
                                {liked ? (
                                    currentReaction === 'LIKE' ? (
                                        <HandThumbUpIconSolid className="h-5 w-5 sm:h-6 sm:w-6" />
                                    ) : (
                                        <span className="text-lg sm:text-xl" aria-hidden>{REACTION_TYPES[currentReaction].icon}</span>
                                    )
                                ) : (
                                    <HandThumbUpIconOutline className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                                <span className={`font-medium text-xs sm:text-sm hidden xs:inline`}>
                                    {liked ? REACTION_TYPES[currentReaction].label : 'Like'}
                                </span>
                                {likeCount > 0 && (
                                    <span className="text-xs sm:text-sm font-medium">
                                        {likeCount}
                                    </span>
                                )}
                            </button>

                            {showReactionPicker && (
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white shadow-xl rounded-xl sm:rounded-2xl p-2 sm:p-3 flex gap-1 sm:gap-2 border border-gray-200 z-10"
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
                                                className={`cursor-pointer transition-transform p-1 sm:p-1.5 text-xl sm:text-2xl rounded-full ${liked && currentReaction === reactionKey ? 'ring-2 ring-blue-400 bg-blue-50 scale-110' : 'hover:scale-125 hover:bg-gray-50'}`}
                                                title={label}
                                            >
                                                {icon}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleToggleComments}
                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 hover:bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span className="font-medium text-xs sm:text-sm hidden xs:inline">Comment</span>
                            {localCommentCount > 0 && (
                                <span className="text-xs sm:text-sm font-medium">{localCommentCount}</span>
                            )}
                        </button>

                        <button
                            onClick={handleRepost}
                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-gray-600 hover:bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all"
                        >
                            <ArrowPathRoundedSquareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span className="font-medium text-xs sm:text-sm hidden xs:inline">Repost</span>
                            {post.repostCount > 0 && (
                                <span className="text-xs sm:text-sm font-medium">{post.repostCount}</span>
                            )}
                        </button>
                    </div>

                    {showComments && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-4">
                            {/* Comment Count Header */}
                            {localCommentCount > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700">
                                        {localCommentCount} {localCommentCount === 1 ? 'Comment' : 'Comments'}
                                    </h4>
                                </div>
                            )}

                            {/* Existing Comments */}
                            {loadingComments ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary-600 mx-auto"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2 sm:gap-3">
                                            <img
                                                src={comment.author?.profilePicture || comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.firstName}+${comment.author?.lastName}`}
                                                alt={comment.author?.firstName}
                                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-gray-200 flex-shrink-0"
                                            />
                                            <div className="flex-1 bg-gray-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                                    <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                                                        {comment.author?.firstName} {comment.author?.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-700 break-words">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {/* Comment Input */}
                            <form onSubmit={handleComment} className="flex gap-2 sm:gap-3">
                                <img
                                    src={user?.profilePicture || user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                                    alt="Your avatar"
                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-gray-200 flex-shrink-0"
                                />
                                <div className="flex-1 flex gap-2 min-w-0">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => {
                                            setCommentContent(e.target.value);
                                            if (commentError) setCommentError(null);
                                        }}
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-0"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentContent.trim() || isSubmitting}
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition flex-shrink-0 ${!commentContent.trim() || isSubmitting
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                        ) : (
                                            'Post'
                                        )}
                                    </button>
                                </div>
                            </form>
                            {commentError && (
                                <p className="mt-2 text-xs sm:text-sm text-red-500 pl-10 sm:pl-13">{commentError}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
