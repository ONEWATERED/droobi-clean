import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2'),
    
    // Set release from environment
    release: process.env.GITHUB_SHA || process.env.npm_package_version,
    
    beforeSend(event) {
      // Filter out development noise
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry server event:', event);
      }
      return event;
    },
  });
}