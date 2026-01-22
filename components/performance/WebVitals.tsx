'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { metrics } from '@/lib/performance/metrics';

export default function WebVitals() {
  // Report Web Vitals to Google Analytics
  useReportWebVitals((metric) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    console.log(metric);
  });

  // Initialize performance tracking
  useEffect(() => {
    metrics.init();
    
    // Track initial page load
    metrics.trackPageLoad(window.location.pathname);
  }, []);

  return null; // This component doesn't render anything
}
