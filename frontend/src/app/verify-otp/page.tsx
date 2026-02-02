'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState('');

  const [verificationType, setVerificationType] = useState<'register' | 'login' | 'verify'>('register');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type') as 'register' | 'login' | 'verify' | null;

    if (emailParam) {
      setEmail(emailParam);
      setVerificationType(typeParam || 'register');
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleChange = (value: string) => {
    // Only allow digits and max 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      // Use different endpoint based on verification type
      const endpoint = verificationType === 'login'
        ? `${apiUrl}/api/auth/login-with-otp`
        : `${apiUrl}/api/auth/verify-email`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // For login or verification, store token and set user in context
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
      }

      setSuccess('Verification successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/feed'; // Redirect to feed after verification
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP sent successfully! Check your email.');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="md" />
          </Link>
          <div className="text-sm text-gray-600">
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
              {verificationType === 'login' ? 'Verify Your Identity' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-600 text-lg">
              We've sent a 6-digit code to
            </p>
            <p className="font-semibold text-gray-900 mt-1">{email}</p>
            {verificationType === 'login' && (
              <p className="text-sm text-gray-500 mt-2">
                For security, we need to verify it's you
              </p>
            )}
            {verificationType === 'verify' && (
              <p className="text-sm text-gray-500 mt-2">
                Please verify your email to continue
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {success}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => handleChange(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-primary-600 text-white py-3.5 rounded-full font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Check your spam folder if you don't see the email</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
