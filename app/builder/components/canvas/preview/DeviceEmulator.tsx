'use client';

import { ReactNode } from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceEmulatorProps {
  device: DeviceType;
  children: ReactNode;
}

const deviceStyles = {
  desktop: {
    container: 'w-full h-full',
    inner: 'w-full h-full',
    frame: '',
  },
  tablet: {
    container: 'flex items-center justify-center w-full h-full p-4',
    inner: 'max-w-[768px] w-full h-full mx-auto rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-300 dark:border-gray-700',
    frame: 'relative',
  },
  mobile: {
    container: 'flex items-center justify-center w-full h-full p-4',
    inner: 'max-w-[375px] w-full h-full mx-auto rounded-[44px] shadow-2xl overflow-hidden border-[12px] border-gray-800 dark:border-gray-600',
    frame: 'relative',
  },
};

export function DeviceEmulator({ device, children }: DeviceEmulatorProps) {
  const style = deviceStyles[device];

  return (
    <div className={`${style.container} bg-gray-100 dark:bg-gray-900`}>
      <div className={style.inner}>
        {/* Optional notch/hole-punch for mobile */}
        {device === 'mobile' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black dark:bg-gray-300 rounded-b-2xl z-10" />
        )}
        <div className="w-full h-full bg-white dark:bg-black overflow-auto">
          {children}
        </div>
        {/* Optional home bar for mobile */}
        {device === 'mobile' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/4 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
        )}
      </div>
    </div>
  );
}
