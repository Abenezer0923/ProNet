'use client';

import { Suspense } from 'react';
import MessagingContent from './MessagingContent';

export default function MessagingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    }>
      <MessagingContent />
    </Suspense>
  );
}
