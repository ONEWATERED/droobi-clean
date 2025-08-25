import { FastifyRequest } from 'fastify';

export function createCorsOptions() {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  
  // Default to localhost in development if not set
  const defaultOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : [];
  
  const allowedOrigins = allowedOriginsEnv 
    ? allowedOriginsEnv.split(',').map(origin => origin.trim())
    : defaultOrigins;
  
  const allowedOriginsSet = new Set(allowedOrigins);
  
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOriginsSet.has(origin)) {
        return callback(null, true);
      }
      
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      // Reject origin
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Admin', 'X-Request-Id']
  };
}