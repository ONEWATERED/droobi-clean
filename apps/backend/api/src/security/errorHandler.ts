import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

export function createErrorHandler() {
  return async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.headers['x-request-id'] as string || 'unknown';
    
    // Log error with minimal context (avoid logging sensitive data)
    const logContext = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: error.statusCode || 500,
      errorCode: error.code,
      message: error.message
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Request error:', logContext, error.stack);
    } else {
      console.error('Request error:', logContext);
    }
    
    // Determine status code
    const statusCode = error.statusCode || 500;
    
    // Create safe error response
    const errorResponse: any = {
      error: statusCode >= 500 ? 'Internal server error' : error.message,
      requestId
    };
    
    // In development, include more details
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        code: error.code,
        statusCode,
        stack: error.stack?.split('\n').slice(0, 5) // Limit stack trace
      };
    }
    
    reply.status(statusCode).send(errorResponse);
  };
}