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

## License

Private repository - all rights reserved.