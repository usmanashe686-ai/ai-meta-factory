'use client';

import { ReactNode } from 'react';

interface MobileSimulatorProps {
  children: ReactNode;
}

export function MobileSimulator({ children }: MobileSimulatorProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 p-6">
      {/* Phone frame */}
      <div className="relative w-full max-w-[375px] h-full max-h-[700px] bg-gray-900 dark:bg-gray-900 rounded-[48px] shadow-2xl overflow-hidden border-4 border-gray-800">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-8 bg-black rounded-b-3xl z-20" />
        
        {/* Screen area */}
        <div className="absolute inset-[6px] bg-white dark:bg-black rounded-[40px] overflow-hidden">
          {children}
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/4 h-1 bg-gray-400 dark:bg-gray-500 rounded-full z-20" />
      </div>
    </div>
  );
}
