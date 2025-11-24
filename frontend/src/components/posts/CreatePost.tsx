import React, { useState, useRef } from 'react';
import {
    PhotoIcon,
    VideoCameraIcon,
    GlobeAltIcon,
    UserGroupIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostProps {
    onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile) return;

        setIsSubmitting(true);
        try {
            // Handle file upload if present (mock implementation for now as backend upload logic needs to be confirmed)
            // For now, we'll just send the content

            const postData = {
                content,
                visibility,
                // images: selectedFile ? [fakeUrl] : [], 
            };

            await api.post('/posts', postData);

            setContent('');
            setSelectedFile(null);
            onPostCreated();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex space-x-3">
                <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                    alt="Your avatar"
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start a post..."
                            className="w-full border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400 text-lg min-h-[80px]"
                        />

                        {selectedFile && (
                            <div className="mb-3 relative inline-block">
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected"
                                    className="h-20 w-auto rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hover:text-blue-600"
                                    title="Add Photo"
                                >
                                    <PhotoIcon className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hover:text-blue-600"
                                    title="Add Video"
                                >
                                    <VideoCameraIcon className="h-6 w-6" />
                                </button>

                                <div className="h-6 w-px bg-gray-200 mx-2 self-center"></div>

                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600"
                                >
                                    <option value="public">Public</option>
                                    <option value="connections">Connections</option>
                                    <option value="community">Community</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={(!content.trim() && !selectedFile) || isSubmitting}
                                className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all ${(!content.trim() && !selectedFile) || isSubmitting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                    }`}
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
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
    );
}
