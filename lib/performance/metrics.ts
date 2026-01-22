export const metrics = {
  trackLoadTime: (name: string, duration: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: duration,
        event_category: 'Performance'
      })
    }
    console.log(`⏱️ ${name}: ${duration}ms`);
  },
  
  trackComponentLoad: (componentName: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      metrics.trackLoadTime(`component_${componentName}`, duration);
    };
  }
};
