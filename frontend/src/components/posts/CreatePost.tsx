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
        <div className={`bg-gradient-to-br from-white via-white to-purple-50/30 rounded-2xl shadow-lg border-2 transition-all duration-300 mb-6 ${isFocused ? 'border-purple-300 shadow-purple-200/50' : 'border-transparent'
            }`}>
            <div className="p-6">
                <div className="flex space-x-4">
                    <div className="relative">
                        <img
                            src={user?.profilePicture || user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                            alt="Your avatar"
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-100"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <SparklesIcon className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => !content && !selectedFile && setIsFocused(false)}
                                placeholder="Share your thoughts, ideas, or updates..."
                                className="w-full border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-base min-h-[100px] bg-transparent"
                            />

                            {selectedFile && (
                                <div className="mb-4 relative inline-block group">
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Selected"
                                        className="h-32 w-auto rounded-xl border-2 border-purple-100 shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* Community Selection */}
                            {communities.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Post to Community (Optional)
                                    </label>
                                    <select
                                        value={selectedCommunity}
                                        onChange={(e) => setSelectedCommunity(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 font-medium"
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
                                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                    <div className="flex items-center space-x-2">
                                        <UserGroupIcon className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm font-semibold text-purple-900">
                                            Posting to {selectedCommunityData.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t-2 border-purple-50">
                                <div className="flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-105 transform"
                                        title="Add Photo"
                                    >
                                        <PhotoIcon className="h-6 w-6" />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2.5 text-pink-600 hover:bg-pink-50 rounded-xl transition-all hover:scale-105 transform"
                                        title="Add Video"
                                    >
                                        <VideoCameraIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!content.trim() && !selectedFile) || isSubmitting}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all transform ${(!content.trim() && !selectedFile) || isSubmitting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Posting...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-2">
                                            <SparklesIcon className="h-4 w-4" />
                                            <span>Share Post</span>
                                        </span>
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
