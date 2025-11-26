'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data, including posts, connections, and messages. Continue?')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/users/account');
      alert('Your account has been deleted successfully.');
      logout();
      router.push('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings & Privacy</h1>
        
        <div className="space-y-6">
          {/* Account Preferences */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Account Preferences</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              <Link 
                href="/profile/edit"
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group"
              >
                <div>
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-primary-700">Profile Information</h3>
                  <p className="text-sm text-gray-500">Name, location, and industry</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Email Address</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button className="text-sm font-medium text-primary-700 hover:text-primary-800">
                    Change
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-500">Choose a unique password to protect your account</p>
                  </div>
                  <button className="text-sm font-medium text-primary-700 hover:text-primary-800">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="max-w-xl">
                  <h3 className="text-base font-medium text-red-600">Close Account</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and remove access to all your data.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition disabled:opacity-50"
                >
                  {deleting ? 'Closing...' : 'Close Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
