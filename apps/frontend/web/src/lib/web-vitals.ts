'use client';

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function logMetric(metric: WebVitalMetric) {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to Sentry if configured and available
  if (process.env.SENTRY_DSN && typeof window !== 'undefined') {
    try {
      // Dynamic import to avoid SSR issues
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureMessage(`Web Vital: ${metric.name}`, {
          level: 'info',
          tags: {
            webVital: metric.name,
            rating: metric.rating,
          },
          extra: {
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
          },
        });
      }).catch(() => {
        // Silently fail if Sentry is not available
      });
    } catch (error) {
      // Silently fail if Sentry is not configured
    }
  }
}

export function initWebVitals() {
  // Only initialize if we're in the browser
  if (typeof window === 'undefined') return;

  try {
    getCLS(logMetric);
    getFID(logMetric);
    getFCP(logMetric);
    getLCP(logMetric);
    getTTFB(logMetric);
  } catch (error) {
    console.warn('Failed to initialize web vitals:', error);
  }
}