'use client';

import { useParams } from 'next/navigation';
import ArticleEditor from '@/components/articles/ArticleEditor';

export default function NewArticlePage() {
    const params = useParams();
    const communityId = params.id as string;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Write an Article</h1>
                    <p className="text-gray-600 mt-2">Share your knowledge with the community</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <ArticleEditor communityId={communityId} />
                </div>
            </div>
        </div>
    );
}
