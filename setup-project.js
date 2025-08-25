#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File contents
const files = {
  'package.json': `{
  "name": "droobi-clean",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier --write \\"**/*.{ts,tsx,md}\\""
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "prettier": "^3.1.0",
    "turbo": "^1.13.4"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}`,

  'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'packages/*'`,

  'turbo.json': `{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}`,

  '.gitignore': `# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Turbo
.turbo`,

  'README.md': `# Droobi Clean

A clean, modular monorepo platform built with modern tools and best practices.

## Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Node.js with Fastify and TypeScript
- **Shared**: Core packages with feature flags and module registry
- **Build**: Turborepo for monorepo management
- **Package Manager**: pnpm with workspaces

## Structure

\`\`\`
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
\`\`\`

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
\`\`\`

This will start:
- Frontend (Next.js): http://localhost:3000
- Backend (Fastify): http://localhost:3001

## Available Scripts

- \`pnpm dev\` - Start all development servers
- \`pnpm build\` - Build all packages and applications
- \`pnpm lint\` - Lint all packages
- \`pnpm typecheck\` - Type check all packages
- \`pnpm test\` - Run tests across all packages

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
- Backend health endpoint: \`GET /health\`
- Frontend health page that displays backend status

### CI/CD
Automated workflows for:
- Dependency installation
- Linting and type checking
- Building and testing
- Runs on pull requests to main branch

## Development

### Adding New Modules

1. Update feature flags in \`packages/core/src/index.ts\`
2. Add module entry to \`modulesRegistry\` array
3. Create corresponding routes in the frontend application

### Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash
BACKEND_URL=http://localhost:3001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
\`\`\`

## Deployment

The monorepo is designed for flexible deployment:

- **Frontend**: Static export ready for CDN deployment
- **Backend**: Containerized Node.js application
- **Packages**: Internal workspace packages

## Contributing

1. Create a feature branch from \`main\`
2. Make your changes
3. Ensure all CI checks pass
4. Submit a pull request

## License

Private repository - all rights reserved.`,

  '.env.example': `# Backend API
BACKEND_URL=http://localhost:3001

# Database
DATABASE_URL=

# Auth
JWT_SECRET=`,

  '.prettierrc': `{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}`,

  '.editorconfig': `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false`,

  'packages/typescript-config/package.json': `{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}`,

  'packages/typescript-config/base.json': `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true
  },
  "exclude": ["node_modules"]
}`,

  'packages/typescript-config/nextjs.json': `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "allowJs": true,
    "declaration": false,
    "declarationMap": false,
    "incremental": true,
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "es6"],
    "module": "esnext",
    "noEmit": true,
    "resolveJsonModule": true,
    "target": "es5"
  },
  "include": ["src", "next-env.d.ts"],
  "exclude": ["node_modules"]
}`,

  'packages/eslint-config/package.json': `{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "./base.js",
  "license": "MIT",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^6.7.4",
    "@typescript-eslint/parser": "^6.7.4",
    "eslint-config-prettier": "^9.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}`,

  'packages/eslint-config/base.js': `const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  plugins: ["@typescript-eslint"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
  ],
};`,

  'packages/eslint-config/next.js': `const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "@typescript-eslint/recommended", "next/core-web-vitals", "prettier"],
  plugins: ["@typescript-eslint"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
    ".next/",
  ],
  overrides: [
    // Force ESLint to detect .tsx files
    { files: ["*.js?(x)", "*.ts?(x)"] },
  ],
};`,

  'packages/core/package.json': `{
  "name": "@repo/core",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "eslint": "^8.48.0",
    "typescript": "^5.2.0"
  }
}`,

  'packages/core/src/index.ts': `export interface FeatureFlags {
  lexicon: boolean;
  directory: boolean;
  microsites: boolean;
  profiles: boolean;
}

export const featureFlags: FeatureFlags = {
  lexicon: true,
  directory: false,
  microsites: false,
  profiles: true,
};

export interface ModuleRegistryItem {
  key: keyof FeatureFlags;
  title: string;
  description: string;
  path: string;
}

export const modulesRegistry: ModuleRegistryItem[] = [
  {
    key: 'lexicon',
    title: 'Lexicon',
    description: 'Comprehensive terminology management system',
    path: '/lexicon',
  },
  {
    key: 'directory',
    title: 'Directory',
    description: 'Professional contact and resource directory',
    path: '/directory',
  },
  {
    key: 'microsites',
    title: 'Microsites',
    description: 'Create and manage dedicated project sites',
    path: '/microsites',
  },
  {
    key: 'profiles',
    title: 'Profiles',
    description: 'User profile and portfolio management',
    path: '/profiles',
  },
];`,

  'packages/core/tsconfig.json': `{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,

  'apps/frontend/web/package.json': `{
  "name": "@repo/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/core": "workspace:*",
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "20.10.0",
    "@types/react": "18.2.39",
    "@types/react-dom": "18.2.17",
    "autoprefixer": "10.4.16",
    "eslint": "8.54.0",
    "eslint-config-next": "14.0.4",
    "postcss": "8.4.32",
    "tailwindcss": "3.3.6",
    "typescript": "5.3.2"
  }
}`,

  'apps/frontend/web/next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/core'],
};

module.exports = nextConfig;`,

  'apps/frontend/web/tsconfig.json': `{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}`,

  'apps/frontend/web/.eslintrc.js': `/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};`,

  'apps/frontend/web/tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};`,

  'apps/frontend/web/postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,

  'apps/frontend/web/src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`,

  'apps/frontend/web/src/app/layout.tsx': `import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Droobi Clean',
  description: 'Modular platform hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,

  'apps/frontend/web/src/app/page.tsx': `import { modulesRegistry, featureFlags } from '@repo/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Droobi Clean</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modular platform providing essential tools and services for modern workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulesRegistry.map((module) => {
            const isEnabled = featureFlags[module.key];
            
            return (
              <Card key={module.key} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {module.title}
                    {isEnabled ? (
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {module.description}
                  </CardDescription>
                  
                  {isEnabled ? (
                    <Link
                      href={module.path}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Launch module
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-md">
                      <Clock className="mr-2 h-3 w-3" />
                      Coming soon
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/health"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            System Health Check
          </Link>
        </div>
      </div>
    </div>
  );
}`,

  'apps/frontend/web/src/app/health/page.tsx': `'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp?: string;
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(\`\${backendUrl}/health\`);
        
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHealthData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Health</h1>
          <p className="text-xl text-gray-600">
            Backend API connectivity status
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {!loading && healthData && <CheckCircle className="mr-2 h-5 w-5 text-green-600" />}
                {!loading && error && <XCircle className="mr-2 h-5 w-5 text-red-600" />}
                API Health Check
              </CardTitle>
              <CardDescription>
                Real-time backend service status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-gray-600">Checking backend status...</p>
              )}
              
              {error && (
                <div className="text-red-600">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
              
              {healthData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600 capitalize">{healthData.status}</span>
                  </div>
                  {healthData.timestamp && (
                    <div className="flex justify-between">
                      <span className="font-medium">Timestamp:</span>
                      <span className="text-gray-600 text-sm">{healthData.timestamp}</span>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-700">
                      {JSON.stringify(healthData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}`,

  'apps/frontend/web/src/components/ui/card.tsx': `import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };`,

  'apps/frontend/web/src/lib/utils.ts': `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,

  'apps/backend/api/package.json': `{
  "name": "@repo/api",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/core": "workspace:*",
    "fastify": "^4.24.3",
    "@fastify/cors": "^8.4.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^20.10.0",
    "eslint": "^8.54.0",
    "tsx": "^4.6.2",
    "typescript": "^5.3.2"
  }
}`,

  'apps/backend/api/tsconfig.json': `{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "lib": ["es2022"],
    "module": "commonjs",
    "target": "es2022",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,

  'apps/backend/api/.eslintrc.js': `/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/base.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};`,

  'apps/backend/api/src/index.ts': `import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: true,
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(\`🚀 API Server running at http://\${host}:\${port}\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();`,

  '.github/workflows/ci.yml': `name: CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: false

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test`
};

function createDirectories() {
  const dirs = [
    'apps/frontend/web/src/app',
    'apps/frontend/web/src/components/ui',
    'apps/frontend/web/src/lib',
    'apps/backend/api/src',
    'packages/core/src',
    'packages/eslint-config',
    'packages/typescript-config',
    '.github/workflows'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  });
}

function createFiles() {
  Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });
    
    // Write file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Created file: ${filePath}`);
  });
}

function main() {
  console.log('🚀 Setting up Droobi Clean monorepo...\n');
  
  createDirectories();
  createFiles();
  
  console.log('\n✅ Project setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm install');
  console.log('2. Run: pnpm dev');
  console.log('3. Create GitHub repository and push code');
  console.log('\nFrontend: http://localhost:3000');
  console.log('Backend: http://localhost:3001');
}

main();