import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Article {
    id: string;
    title: string;
    excerpt: string;
    coverImage?: string;
    author: {
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    createdAt: string;
    readingTime: number;
    clapCount: number;
    commentCount: number;
}

interface ArticleCardProps {
    article: Article;
    communityId: string;
}

export default function ArticleCard({ article, communityId }: ArticleCardProps) {
    return (
        <Link href={`/communities/${communityId}/articles/${article.id}`}>
            <div className="group flex gap-6 p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            {article.author.profileImage ? (
                                <img
                                    src={article.author.profileImage}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                            )}
                            <span className="font-medium text-gray-900">
                                {article.author.firstName} {article.author.lastName}
                            </span>
                        </div>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(article.createdAt))} ago</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {article.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                            {article.readingTime} min read
                        </span>
                        <div className="flex items-center gap-1">
                            <span>👏</span>
                            <span>{article.clapCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>💬</span>
                            <span>{article.commentCount}</span>
                        </div>
                    </div>
                </div>

                {article.coverImage && (
                    <div className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}
