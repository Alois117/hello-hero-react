/**
 * Performance Monitoring Utilities
 * Track key performance metrics for dashboard and alerts
 */

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  tti: number; // Time to Interactive
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
}

/**
 * Measure First Contentful Paint
 */
export const measureFCP = (): Promise<number> => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        resolve(fcpEntry.startTime);
        observer.disconnect();
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  });
};

/**
 * Measure Time to Interactive
 */
export const measureTTI = (): Promise<number> => {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          resolve(entries[0].startTime);
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      
      // Fallback: resolve after 5 seconds
      setTimeout(() => {
        resolve(5000);
        observer.disconnect();
      }, 5000);
    } else {
      resolve(0);
    }
  });
};

/**
 * Measure Largest Contentful Paint
 */
export const measureLCP = (): Promise<number> => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      resolve(lastEntry.startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Resolve after 10 seconds max
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  });
};

/**
 * Get all performance metrics
 */
export const getPerformanceMetrics = async (): Promise<Partial<PerformanceMetrics>> => {
  const metrics: Partial<PerformanceMetrics> = {};
  
  try {
    metrics.fcp = await measureFCP();
    metrics.tti = await measureTTI();
    metrics.lcp = await measureLCP();
  } catch (error) {
    console.warn('Error measuring performance:', error);
  }
  
  return metrics;
};

/**
 * Log performance metrics to console (development only)
 */
export const logPerformanceMetrics = async () => {
  if (import.meta.env.DEV) {
    const metrics = await getPerformanceMetrics();
    console.group('📊 Performance Metrics');
    console.log('First Contentful Paint (FCP):', metrics.fcp?.toFixed(2), 'ms');
    console.log('Time to Interactive (TTI):', metrics.tti?.toFixed(2), 'ms');
    console.log('Largest Contentful Paint (LCP):', metrics.lcp?.toFixed(2), 'ms');
    console.groupEnd();
    
    // Performance scoring
    if (metrics.fcp && metrics.fcp < 1800) {
      console.log('✅ FCP: Good (< 1.8s)');
    } else if (metrics.fcp && metrics.fcp < 3000) {
      console.log('⚠️ FCP: Needs Improvement (1.8s - 3s)');
    } else {
      console.log('❌ FCP: Poor (> 3s)');
    }
    
    if (metrics.lcp && metrics.lcp < 2500) {
      console.log('✅ LCP: Good (< 2.5s)');
    } else if (metrics.lcp && metrics.lcp < 4000) {
      console.log('⚠️ LCP: Needs Improvement (2.5s - 4s)');
    } else {
      console.log('❌ LCP: Poor (> 4s)');
    }
  }
};

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string) => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (import.meta.env.DEV) {
      console.log(`⚡ ${componentName} render time:`, duration.toFixed(2), 'ms');
    }
    
    return duration;
  };
};
