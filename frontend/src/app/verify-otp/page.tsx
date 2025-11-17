'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState('');

  const [verificationType, setVerificationType] = useState<'register' | 'login'>('register');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type') as 'register' | 'login' | null;
    
    if (emailParam) {
      setEmail(emailParam);
      setVerificationType(typeParam || 'register');
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Use different endpoint based on verification type
      const endpoint = verificationType === 'login' 
        ? `${apiUrl}/auth/login-with-otp`
        : `${apiUrl}/auth/verify-otp`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // For login, store token and set user in context
      if (verificationType === 'login' && data.token && data.user) {
        localStorage.setItem('token', data.token);
        // Dynamically import and use loginWithToken
        const { useAuth } = await import('@/contexts/AuthContext');
        // We can't use hooks here, so we'll just store the token and let the dashboard handle it
      }

      setSuccess('Verification successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard'; // Use window.location for full page reload
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
      const response = await fetch(`${apiUrl}/auth/resend-otp`, {
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
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-lg"></div>
            <span className="text-2xl font-bold text-gray-900">ProNet</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {verificationType === 'login' ? 'Verify Your Identity' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to<br />
            <span className="font-semibold">{email}</span>
          </p>
          {verificationType === 'login' && (
            <p className="text-sm text-gray-500 mt-2">
              For security, we need to verify it's you
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter OTP Code
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.some(d => !d)}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm">
              Back to login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Check your spam folder if you don't see the email</p>
        </div>
      </div>
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
