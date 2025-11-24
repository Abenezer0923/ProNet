'use client';

import React from 'react';
import {
    DocumentIcon,
    DocumentTextIcon,
    PhotoIcon,
    VideoCameraIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Attachment {
    url: string;
    filename: string;
    fileType: string;
    size: number;
}

interface FileAttachmentProps {
    attachment: Attachment;
}

export default function FileAttachment({ attachment }: FileAttachmentProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = attachment.fileType.startsWith('image/');
    const isVideo = attachment.fileType.startsWith('video/');
    const isPDF = attachment.fileType === 'application/pdf';

    // Image preview
    if (isImage) {
        return (
            <div className="relative group rounded-xl overflow-hidden border-2 border-purple-100 max-w-md">
                <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="w-full h-auto max-h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <a
                        href={attachment.url}
                        download={attachment.filename}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download
                    </a>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">
                        {attachment.filename}
                    </p>
                    <p className="text-white/80 text-xs">{formatFileSize(attachment.size)}</p>
                </div>
            </div>
        );
    }

    // Video preview
    if (isVideo) {
        return (
            <div className="rounded-xl overflow-hidden border-2 border-purple-100 max-w-md">
                <video
                    src={attachment.url}
                    controls
                    className="w-full h-auto max-h-96 bg-black"
                />
                <div className="bg-gray-50 p-3 border-t border-purple-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
            </div>
        );
    }

    // PDF preview
    if (isPDF) {
        return (
            <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl hover:border-red-300 transition-all max-w-md group"
            >
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DocumentTextIcon className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">PDF • {formatFileSize(attachment.size)}</p>
                </div>
                <ArrowDownTrayIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
            </a>
        );
    }

    // Generic file
    return (
        <a
            href={attachment.url}
            download={attachment.filename}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-300 transition-all max-w-md group"
        >
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <DocumentIcon className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                    {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                    {attachment.fileType.split('/')[1]?.toUpperCase() || 'File'} •{' '}
                    {formatFileSize(attachment.size)}
                </p>
            </div>
            <ArrowDownTrayIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
        </a>
    );
}
