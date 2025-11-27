'use client';

import { Suspense } from 'react';
import MessagingContent from './MessagingContent';

export default function MessagingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <MessagingContent />
    </Suspense>
  );
}
