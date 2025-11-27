'use client';

import { Suspense } from 'react';
import ChatContent from './ChatContent';

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
