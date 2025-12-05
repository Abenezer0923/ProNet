import React, { useState, useRef, useEffect } from 'react';
import {
    PhotoIcon,
    VideoCameraIcon,
    SparklesIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostProps {
    onPostCreated: () => void;
}

interface Community {
    id: string;
    name: string;
    avatar?: string;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState<string>('');
    const [communities, setCommunities] = useState<Community[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUserCommunities();
    }, []);

    const fetchUserCommunities = async () => {
        try {
            const response = await api.get('/communities/my');
            setCommunities(response.data);
        } catch (error) {
            console.error('Error fetching communities:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;

        setIsSubmitting(true);
        try {
            let imageUrl = '';

            // Upload image if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadResponse = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = uploadResponse.data.url;
            }

            const postData: any = {
                content,
                visibility: selectedCommunity ? 'community' : 'public',
            };

            if (imageUrl) {
                postData.images = [imageUrl];
            }

            if (selectedCommunity) {
                postData.communityId = selectedCommunity;
            }

            await api.post('/posts', postData);

            setContent('');
            setSelectedFile(null);
            setSelectedCommunity('');
            setIsFocused(false);
            onPostCreated();
        } catch (error: any) {
            console.error('Error creating post:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create post';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const selectedCommunityData = communities.find(c => c.id === selectedCommunity);

    return (
        <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border transition-all duration-300 mb-4 sm:mb-5 ${isFocused ? 'border-primary-300 shadow-md' : 'border-gray-200'
            }`}>
            <div className="p-3 sm:p-4 md:p-5">
                <div className="flex space-x-3 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                        <img
                            src={user?.profilePicture || user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                            alt="Your avatar"
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-gray-200"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => !content && !selectedFile && setIsFocused(false)}
                                placeholder="What's on your mind?"
                                className="w-full border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500 text-sm sm:text-base min-h-[60px] sm:min-h-[80px] bg-transparent p-0"
                            />

                            {selectedFile && (
                                <div className="mb-3 sm:mb-4 relative inline-block group">
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Selected"
                                        className="h-24 sm:h-32 w-auto rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:scale-110 transform"
                                    >
                                        <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Community Selection */}
                            {communities.length > 0 && (
                                <div className="mb-3 sm:mb-4">
                                    <select
                                        value={selectedCommunity}
                                        onChange={(e) => setSelectedCommunity(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-700 text-sm sm:text-base"
                                    >
                                        <option value="">🌍 Public Post</option>
                                        {communities.map((community) => (
                                            <option key={community.id} value={community.id}>
                                                👥 {community.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedCommunityData && (
                                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary-50 rounded-lg sm:rounded-xl border border-primary-200">
                                    <div className="flex items-center space-x-2">
                                        <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                                        <span className="text-xs sm:text-sm font-semibold text-primary-900">
                                            Posting to {selectedCommunityData.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all text-xs sm:text-sm font-medium"
                                        title="Add Photo"
                                    >
                                        <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                        <span className="hidden sm:inline">Photo</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all text-xs sm:text-sm font-medium"
                                        title="Add Video"
                                    >
                                        <VideoCameraIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                        <span className="hidden sm:inline">Video</span>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!content.trim() && !selectedFile) || isSubmitting}
                                    className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all ${(!content.trim() && !selectedFile) || isSubmitting
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                            <span className="hidden sm:inline">Posting...</span>
                                        </span>
                                    ) : (
                                        'Post'
                                    )}
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
