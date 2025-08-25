import Fastify from 'fastify';

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
    console.log(`🚀 API Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();