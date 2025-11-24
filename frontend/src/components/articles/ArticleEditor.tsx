'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../ImageUpload';
import axios from 'axios';

interface ArticleEditorProps {
    communityId: string;
    initialData?: {
        title: string;
        content: string;
        coverImage?: string;
        tags?: string[];
        status?: 'draft' | 'published';
    };
}

export default function ArticleEditor({ communityId, initialData }: ArticleEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const articleData = {
                title,
                content,
                coverImage,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                status,
            };

            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/communities/${communityId}/articles`,
                articleData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            router.push(`/communities/${communityId}?tab=articles`);
            router.refresh();
        } catch (error: any) {
            console.error('Error creating article:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create article';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <ImageUpload
                    currentImage={coverImage}
                    onUploadComplete={setCoverImage}
                    type="cover"
                    label="Cover Image"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter article title..."
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="Write your article content here (Markdown supported)..."
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma separated)
                </label>
                <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="technology, career, advice"
                />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Public</option>
                    </select>
                </div>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </div>
        </form>
    );
}
