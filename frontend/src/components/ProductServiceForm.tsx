'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ImageUpload from './ImageUpload';

interface ProductServiceFormProps {
  productService?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductServiceForm({ productService, onSave, onCancel }: ProductServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productService) {
      setFormData({
        title: productService.title || '',
        description: productService.description || '',
        imageUrl: productService.imageUrl || '',
        category: productService.category || '',
      });
    }
  }, [productService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (productService) {
        await api.put(`/users/product-services/${productService.id}`, formData);
      } else {
        await api.post('/users/product-services', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product/service:', error);
      alert('Failed to save product/service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {productService ? 'Edit Product/Service' : 'Add Product/Service'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Cloud Consulting Services"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Describe your product or service..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Consulting, Software, Training"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <ImageUpload
                type="post"
                label="Product/Service Image"
                currentImage={formData.imageUrl}
                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
