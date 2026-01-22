// Analytics utility for tracking user events
class Analytics {
  private static instance: Analytics;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Initialize any analytics SDKs here
    this.isInitialized = true;
    console.log('Analytics initialized');
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized) this.initialize();
    
    console.log('Tracking event:', eventName, properties);
    
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // Send to backend
    this.sendToBackend(eventName, properties).catch(console.error);
  }

  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.trackEvent('page_view', {
      page_name: pageName,
      ...properties,
    });
  }

  trackUserAction(action: string, component?: string, properties?: Record<string, any>) {
    this.trackEvent('user_action', {
      action,
      component,
      ...properties,
    });
  }

  trackConversion(eventName: string, value?: number, properties?: Record<string, any>) {
    this.trackEvent('conversion', {
      event_name: eventName,
      value,
      ...properties,
    });
  }

  private async sendToBackend(eventName: string, properties?: Record<string, any>) {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          properties,
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          userId: this.getUserId(),
        }),
      });
    } catch (err) {
      console.warn('Failed to send analytics event to backend:', err);
    }
  }

  private getUserId(): string {
    // Get user ID from localStorage or authentication
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id') || 'anonymous';
    }
    return 'anonymous';
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Helper functions for common events
export const trackEvents = {
  // User events
  signUp: (method: string) => analytics.trackEvent('sign_up', { method }),
  login: (method: string) => analytics.trackEvent('login', { method }),
  logout: () => analytics.trackEvent('logout'),
  
  // Builder events
  createProject: (template?: string) => analytics.trackEvent('create_project', { template }),
  generateComponent: (aiModel: string, complexity: string) => 
    analytics.trackEvent('generate_component', { ai_model: aiModel, complexity }),
  exportProject: (format: string) => analytics.trackEvent('export_project', { format }),
  
  // Monetization events
  viewPricing: () => analytics.trackEvent('view_pricing'),
  startCheckout: (plan: string) => analytics.trackEvent('start_checkout', { plan }),
  completePurchase: (plan: string, amount: number) => 
    analytics.trackEvent('complete_purchase', { plan, amount }),
  
  // Engagement events
  shareProject: (platform: string) => analytics.trackEvent('share_project', { platform }),
  inviteTeammate: () => analytics.trackEvent('invite_teammate'),
  useTemplate: (templateId: string) => analytics.trackEvent('use_template', { template_id: templateId }),
};

// React hook for analytics
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    ...trackEvents,
  };
}
