'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface CertificationFormProps {
  certification?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function CertificationForm({ certification, onSave, onCancel }: CertificationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    doesNotExpire: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (certification) {
      setFormData({
        name: certification.name || '',
        issuingOrganization: certification.issuingOrganization || '',
        issueDate: certification.issueDate ? certification.issueDate.split('T')[0] : '',
        expirationDate: certification.expirationDate ? certification.expirationDate.split('T')[0] : '',
        credentialId: certification.credentialId || '',
        credentialUrl: certification.credentialUrl || '',
        doesNotExpire: certification.doesNotExpire || false,
      });
    }
  }, [certification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (certification) {
        await api.put(`/users/certifications/${certification.id}`, formData);
      } else {
        await api.post('/users/certifications', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving certification:', error);
      alert('Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {certification ? 'Edit Certification' : 'Add Certification'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuing Organization *
              </label>
              <input
                type="text"
                value={formData.issuingOrganization}
                onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                required
                placeholder="e.g. Amazon Web Services"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  disabled={formData.doesNotExpire}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="doesNotExpire"
                checked={formData.doesNotExpire}
                onChange={(e) => setFormData({ ...formData, doesNotExpire: e.target.checked, expirationDate: e.target.checked ? '' : formData.expirationDate })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="doesNotExpire" className="ml-2 text-sm text-gray-700">
                This certification does not expire
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential ID
              </label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                placeholder="e.g. ABC123XYZ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential URL
              </label>
              <input
                type="url"
                value={formData.credentialUrl}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
