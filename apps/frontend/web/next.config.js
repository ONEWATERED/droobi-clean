const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/core'],
};

// Only wrap with Sentry if DSN is configured
if (process.env.SENTRY_DSN) {
  module.exports = withSentryConfig(
    nextConfig,
    {
      // Sentry webpack plugin options
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      // Upload options
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
      disableLogger: true,
    }
  );
} else {
  module.exports = nextConfig;
}