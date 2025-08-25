import * as Sentry from '@sentry/node';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

// Initialize Sentry only if DSN is configured
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

export async function sentryPlugin(fastify: FastifyInstance) {
  // Only register hooks if Sentry is configured
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // Add request ID and start transaction
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Generate request ID if not present
    const requestId = request.headers['x-request-id'] as string || randomUUID();
    request.headers['x-request-id'] = requestId;
    
    // Set response header
    reply.header('x-request-id', requestId);
    
    // Start Sentry transaction
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${request.method} ${request.routerPath || request.url}`,
      data: {
        method: request.method,
        url: request.url,
        route: request.routerPath,
        requestId,
      },
    });
    
    // Store transaction in request context
    (request as any).sentryTransaction = transaction;
    
    // Set Sentry context
    Sentry.configureScope((scope) => {
      scope.setTag('requestId', requestId);
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        headers: request.headers,
      });
    });
  });

  // Handle errors
  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    const requestId = request.headers['x-request-id'] as string;
    
    // Capture exception with context
    Sentry.withScope((scope) => {
      scope.setTag('requestId', requestId);
      scope.setLevel('error');
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        headers: request.headers,
      });
      scope.setContext('response', {
        statusCode: reply.statusCode,
      });
      
      Sentry.captureException(error);
    });
  });

  // Finish transaction
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const transaction = (request as any).sentryTransaction;
    if (transaction) {
      transaction.setHttpStatus(reply.statusCode);
      transaction.finish();
    }
  });
}