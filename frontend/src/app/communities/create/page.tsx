'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

const DEFAULT_CATEGORIES = [
  'Technology',
  'Business',
  'Marketing',
  'Design',
  'Healthcare',
  'Education',
  'Finance',
  'Engineering',
  'Sales',
  'HR',
  'Other',
];

const normalizeCategoryResponse = (data: unknown): string[] => {
  const extractFromArray = (items: unknown[]): string[] =>
    items
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const candidate = ['name', 'title', 'label']
            .map((key) => record[key])
            .find((value): value is string => typeof value === 'string');
          if (candidate) {
            return candidate;
          }
        }
        return '';
      })
      .filter((item): item is string => Boolean(item));

  if (Array.isArray(data)) {
    return extractFromArray(data);
  }

  if (data && typeof data === 'object' && Array.isArray((data as any).categories)) {
    return extractFromArray((data as any).categories);
  }

  return [];
};

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    coverImage: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchCategories();
    }
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/communities/categories');
      const normalizedCategories = normalizeCategoryResponse(response.data);

      if (normalizedCategories.length === 0) {
        throw new Error('No categories returned from API');
      }

      setCategories(normalizedCategories);
      setFormData((prev) => ({
        ...prev,
        category: normalizedCategories.includes(prev.category)
          ? prev.category
          : normalizedCategories[0],
      }));
      setCategoryError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(DEFAULT_CATEGORIES);
      setFormData((prev) => ({
        ...prev,
        category: DEFAULT_CATEGORIES.includes(prev.category)
          ? prev.category
          : DEFAULT_CATEGORIES[0],
      }));
      setCategoryError('Unable to load categories from the server. Showing a default list instead.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Creating community with data:', formData);

    try {
      const response = await api.post('/communities', formData);
      console.log('Community created successfully:', response.data);
      router.push(`/communities/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating community:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to create community: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">ProNet</span>
            </Link>
            <Link
              href="/communities"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create a Community
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Software Developers Network"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe what your community is about..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={categoriesLoading || categories.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              {categoriesLoading && categories.length === 0 ? (
                <option value="">Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              )}
            </select>
            {categoryError && (
              <p className="mt-2 text-sm text-rose-600">{categoryError}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Make this community private (invite-only)
            </label>
          </div>

          <div>
            <ImageUpload
              type="community"
              label="Cover Image"
              currentImage={formData.coverImage}
              onUploadComplete={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  coverImage: url,
                }))
              }
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/communities"
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || categoriesLoading || !formData.category}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
