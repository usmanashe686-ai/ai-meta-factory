'use client';

import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

interface ErrorEvent {
  error: Error | string;
  componentStack?: string;
  properties?: Record<string, any>;
}

/**
 * Custom hook for tracking user interactions and errors.
 * In development, logs to console. In production, sends to a backend endpoint.
 */
export const useAnalytics = () => {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  const trackPageView = useCallback((path: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Page view: ${path}`);
    } else {
      // Send to analytics backend
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, timestamp: new Date().toISOString() }),
      }).catch(err => console.error('Failed to send pageview:', err));
    }
  }, []);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${event.name}`, event.properties);
    } else {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: event.name,
          properties: event.properties,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Failed to send event:', err));
    }
  }, []);

  const trackError = useCallback((errorEvent: ErrorEvent) => {
    const errorMessage = typeof errorEvent.error === 'string'
      ? errorEvent.error
      : errorEvent.error.message || 'Unknown error';
    const stack = typeof errorEvent.error === 'object' ? errorEvent.error.stack : '';

    if (process.env.NODE_ENV === 'development') {
      console.error(`[Analytics] Error: ${errorMessage}`, { stack, ...errorEvent.properties });
    } else {
      fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: errorMessage,
          stack,
          componentStack: errorEvent.componentStack,
          properties: errorEvent.properties,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Failed to send error:', err));
    }
  }, []);

  return {
    trackEvent,
    trackError,
  };
};

export default useAnalytics;
