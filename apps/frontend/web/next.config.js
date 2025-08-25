const { withSentryConfig } = require('@sentry/nextjs');

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/core'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
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