# Droobi Clean

A clean, modular monorepo platform built with modern tools and best practices.

## Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Node.js with Fastify and TypeScript
- **Shared**: Core packages with feature flags and module registry
- **Build**: Turborepo for monorepo management
- **Package Manager**: pnpm with workspaces

## Structure

```
droobi-clean/
├── apps/
│   ├── frontend/web/     # Next.js web application
│   └── backend/api/      # Fastify API server
├── packages/
│   ├── core/            # Shared core functionality
│   ├── eslint-config/   # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
├── .github/workflows/   # CI/CD workflows
└── configuration files
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

This will start:
- Frontend (Next.js): http://localhost:3000
- Backend (Fastify): http://localhost:3001

## Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and applications
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm test` - Run tests across all packages

## Features

### Modular Architecture
The platform uses a module registry system with feature flags to control which modules are available:

- **Lexicon**: Terminology management system
- **Directory**: Professional contact directory  
- **Microsites**: Dedicated project sites
- **Profiles**: User profile management

### Landing Hub
The main page displays available modules as interactive tiles, showing "Coming soon" for disabled features.

### Health Monitoring
- Backend health endpoint: `GET /health`
- Frontend health page that displays backend status

### CI/CD
Automated workflows for:
- Dependency installation
- Linting and type checking
- Building and testing
- Runs on pull requests to main branch

## Development

### Adding New Modules

1. Update feature flags in `packages/core/src/index.ts`
2. Add module entry to `modulesRegistry` array
3. Create corresponding routes in the frontend application

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
BACKEND_URL=http://localhost:3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## Deployment

The monorepo is designed for flexible deployment:

- **Frontend**: Static export ready for CDN deployment
- **Backend**: Containerized Node.js application
- **Packages**: Internal workspace packages

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all CI checks pass
4. Submit a pull request

## Observability

The platform includes optional monitoring and observability features:

### Sentry Error Monitoring

To enable Sentry error tracking, set these environment variables:

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.2
```

When configured, Sentry will:
- Capture unhandled errors and exceptions
- Monitor performance with 20% sampling
- Track web vitals (CLS, FID, LCP, etc.)
- Provide request tracing and context

Test error capture by visiting `/debug-error?boom=1`.

### OpenTelemetry Distributed Tracing

To enable OpenTelemetry tracing for the backend API, set:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.your-observer.com/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=api-key=your-api-key
OTEL_SERVICE_NAME_API=droobi-api
```

When configured, OpenTelemetry will:
- Auto-instrument HTTP requests, database calls, and external services
- Export traces to your OTLP-compatible backend (Jaeger, Zipkin, etc.)
- Provide distributed tracing across services

Test the backend instrumentation by visiting `/debug-error?boom=1`.

### Disabling Observability

When environment variables are unset, all observability features are disabled and will not impact performance or functionality.

## PR Previews (Cloud Run)

Every pull request automatically deploys preview environments for both the web app and API to Google Cloud Run. Preview URLs are posted as PR comments, and resources are automatically cleaned up when PRs are closed.

### Setup

To enable PR previews, add the following repository secrets:

**Go to Settings → Secrets and variables → Actions and add:**

- `GCP_PROJECT_ID` - Your Google Cloud Project ID
- `GCP_REGION` - Deployment region (e.g., `us-central1`)
- `GCP_SA_KEY` - Service Account JSON key with required roles

### Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to IAM & Admin → Service Accounts
3. Create a new service account or use existing
4. Add the following roles:
   - `roles/run.admin` - Deploy and manage Cloud Run services
   - `roles/iam.serviceAccountUser` - Use service accounts
   - `roles/artifactregistry.writer` - Push container images
5. Generate a JSON key and add it as the `GCP_SA_KEY` secret

### How it Works

- **On PR Open/Update**: Deploys both apps to Cloud Run with unique service names
- **Environment**: Each PR gets isolated data namespace (`pr-{number}`)
- **URLs**: Posted as PR comments with direct links to preview environments
- **Cleanup**: Services are automatically deleted when PR is closed
- **Fallback**: If secrets aren't configured, workflow posts setup instructions instead

### Preview Environment Details

- **API Service**: `droobi-api-pr-{number}`
- **Web Service**: `droobi-web-pr-{number}`
- **Configuration**: Development environment with isolated data
- **Scaling**: Min 0 instances (cost-effective), max 2 instances
- **Access**: Public (no authentication required for previews)

**Note**: If secrets aren't configured, the workflow will gracefully exit and post setup instructions instead of failing.

## Production Deployments

Production deployments are triggered automatically when you push a git tag starting with `v` (e.g., `v1.0.0`, `v2.1.3`).

### Setup

To enable production deployments, add the following repository secrets:

**Go to Settings → Secrets and variables → Actions and add:**

**Required:**
- `GCP_PROJECT_ID` - Your Google Cloud Project ID
- `GCP_REGION` - Production deployment region (e.g., `us-central1`)
- `GCP_SA_KEY` - Service Account JSON key with required roles

**Optional (for observability):**
- `SENTRY_DSN_API` - Sentry DSN for API error monitoring
- `SENTRY_DSN_WEB` - Sentry DSN for web error monitoring
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OpenTelemetry traces endpoint
- `OTEL_EXPORTER_OTLP_HEADERS` - OpenTelemetry authentication headers

### Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to IAM & Admin → Service Accounts
3. Create a new service account or use existing
4. Add the following roles:
   - `roles/run.admin` - Deploy and manage Cloud Run services
   - `roles/iam.serviceAccountUser` - Use service accounts
   - `roles/artifactregistry.writer` - Push container images
5. Generate a JSON key and add it as the `GCP_SA_KEY` secret

### How to Deploy

1. **Tag Release**: Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Manual Deploy**: Use GitHub Actions workflow dispatch:
   - Go to Actions → Production Release
   - Click "Run workflow"
   - Enter the tag name (e.g., `v1.0.0`)

### Production Environment Details

- **API Service**: `droobi-api` (stable production name)
- **Web Service**: `droobi-web` (stable production name)
- **Configuration**: Production environment with full feature set
- **Scaling**: Min 1 instance (always warm), max 10 instances
- **Resources**: 1 CPU, 1GB RAM per service
- **Access**: Public (configure authentication as needed)
- **Monitoring**: Full observability stack when configured

### Deployment Features

- **Zero Downtime**: Rolling deployments with health checks
- **Auto Scaling**: Scales from 1-10 instances based on traffic
- **Always Warm**: Min 1 instance prevents cold starts
- **Environment Isolation**: Production data namespace
- **Feature Flags**: Remote flags enabled for dynamic configuration
- **Observability**: Full Sentry and OpenTelemetry integration
- **URL Notification**: Deployment URLs posted as commit comments

**Note**: If secrets aren't configured, the workflow will gracefully exit and post setup instructions instead of failing.

## License

Private repository - all rights reserved.

## Admin Status

The platform includes a comprehensive admin status dashboard for monitoring system health and metrics.

### Accessing Admin Status

To access the admin status dashboard:

1. Set `NEXT_PUBLIC_ADMIN_MODE=1` in your environment
2. Navigate to `/admin/status`

### Features

The admin status page displays:

- **API Health**: Service status, uptime, environment, and readiness checks
- **Build Information**: Version numbers and commit SHAs for both web and API
- **Feature Flags**: Currently enabled/disabled platform features
- **Content Metrics**: Data counts across all modules (lexicon, directory, projects, etc.)
- **Auto-refresh**: Optional 10-second auto-refresh for real-time monitoring
- **JSON Export**: Copy complete status data as JSON for external monitoring

### API Endpoints

The following endpoints support the admin dashboard:

- `GET /version` - API version and build information
- `GET /ready` - Readiness check (200 if ready, 503 if not)
- `GET /admin/status` - Comprehensive status including health, flags, and counts
- `GET /api/version` - Web application version information

### Monitoring Integration

When Sentry is configured, the status page includes a direct link to your Sentry project for error monitoring and performance insights.

## PR Previews (Cloud Run)

Every pull request automatically deploys preview environments for both the web app and API to Google Cloud Run. Preview URLs are posted as PR comments, and resources are automatically cleaned up when PRs are closed.

### Setup

To enable PR previews, add the following repository secrets:

**Go to Settings → Secrets and variables → Actions and add:**

- `GCP_PROJECT_ID` - Your Google Cloud Project ID
- `GCP_REGION` - Deployment region (e.g., `us-central1`)
- `GCP_SA_KEY` - Service Account JSON key with required roles

### Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to IAM & Admin → Service Accounts
3. Create a new service account or use existing
4. Add the following roles:
   - `roles/run.admin` - Deploy and manage Cloud Run services
   - `roles/iam.serviceAccountUser` - Use service accounts
   - `roles/artifactregistry.writer` - Push container images
5. Generate a JSON key and add it as the `GCP_SA_KEY` secret

### How it Works

- **On PR Open/Update**: Deploys both apps to Cloud Run with unique service names
- **Environment**: Each PR gets isolated data namespace (`pr-{number}`)
- **URLs**: Posted as PR comments with direct links to preview environments
- **Cleanup**: Services are automatically deleted when PR is closed
- **Fallback**: If secrets aren't configured, workflow posts setup instructions instead

### Preview Environment Details

- **API Service**: `droobi-api-pr-{number}`
- **Web Service**: `droobi-web-pr-{number}`
- **Configuration**: Development environment with isolated data
- **Scaling**: Min 0 instances (cost-effective), max 2 instances
- **Access**: Public (no authentication required for previews)

**Note**: If secrets aren't configured, the workflow will gracefully exit and post setup instructions instead of failing.