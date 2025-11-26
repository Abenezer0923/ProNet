import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated glow rings */}
        <div className="absolute inset-0 bg-primary-300 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-primary-400 rounded-full animate-pulse opacity-10"></div>

        {/* Logo container with pulse animation */}
        <div className="relative bg-white p-6 rounded-2xl shadow-2xl animate-logo-pulse">
          <Logo size="lg" />
        </div>
      </div>

      {/* Loading text and progress bar */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="h-1.5 w-40 bg-primary-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700 animate-progress w-full origin-left"></div>
        </div>
        <p className="text-primary-700 font-semibold text-sm animate-pulse">Loading ProNet...</p>
      </div>
    </div>
  );
};
