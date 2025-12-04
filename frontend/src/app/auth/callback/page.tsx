'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

// Callback handler component
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const requiresVerification = searchParams.get('requiresVerification') === 'true';
    const email = searchParams.get('email');

    if (token) {
      // Store token first
      localStorage.setItem('token', token);

      // If requires verification, redirect to OTP page
      if (requiresVerification && email) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }

      // Fetch user data
      api.get('/auth/me')
        .then(res => {
          const user = res.data;
          // Set user in context
          loginWithToken(user, token);
          // Small delay to ensure state is updated before redirect
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
          router.push('/login?error=auth_failed');
        });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, loginWithToken]);

  return <LoadingSpinner />;
}

// Main component with Suspense boundary
export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CallbackHandler />
    </Suspense>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
