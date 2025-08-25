import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2'),
    
    integrations: [
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      }),
    ],
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Set release from environment
    release: process.env.GITHUB_SHA || process.env.npm_package_version,
    
    beforeSend(event) {
      // Filter out development noise
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event:', event);
      }
      return event;
    },
  });
}