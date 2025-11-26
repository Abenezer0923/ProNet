import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-200 rounded-full animate-ping opacity-20"></div>
        <div className="relative bg-white p-4 rounded-2xl shadow-xl animate-bounce">
          <Logo size="lg" />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="h-1 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 animate-progress w-full origin-left"></div>
        </div>
        <p className="text-primary-600 font-medium text-sm animate-pulse">Loading ProNet...</p>
      </div>
    </div>
  );
};
