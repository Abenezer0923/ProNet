'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  type: 'profile' | 'community' | 'post' | 'cover';
  label?: string;
}

export default function ImageUpload({
  onUploadComplete,
  currentImage,
  type,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (15MB for all types)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 15MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint =
        type === 'profile'
          ? '/upload/profile-picture'
          : type === 'community'
          ? '/upload/community-image'
          : '/upload/post-image';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadComplete(response.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`w-full object-cover rounded-lg ${
              type === 'profile' ? 'h-32 w-32' : type === 'community' ? 'h-48' : 'h-64'
            }`}
          />
          <div className="mt-2 flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF, WebP up to 15MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"></div>
          <p>Uploading...</p>
        </div>
      )}
    </div>
  );
}
