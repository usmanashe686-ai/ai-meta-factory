// Error tracking utility for client-side errors
class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{error: Error, context?: any}> = [];

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  captureError(error: Error, context?: any) {
    console.error('Captured error:', error, context);
    
    // Store error locally
    this.errors.push({ error, context });
    
    // Send to backend (if implemented)
    if (typeof window !== 'undefined') {
      this.sendToBackend(error, context).catch(console.error);
    }
    
    // Optionally send to external service (Sentry, etc.)
    this.sendToExternalService(error, context);
  }

  private async sendToBackend(error: Error, context?: any) {
    try {
      await fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Failed to send error to backend:', err);
    }
  }

  private sendToExternalService(error: Error, context?: any) {
    // This would integrate with services like Sentry
    // For now, we'll just log it
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    }
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Helper function to capture errors
export function captureError(error: Error, context?: any) {
  errorTracker.captureError(error, context);
}

// React hook for error tracking
export function useErrorTracking() {
  return {
    captureError,
    getErrorCount: () => errorTracker.getErrorCount(),
    clearErrors: () => errorTracker.clearErrors(),
  };
}
