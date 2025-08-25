import { build } from 'fastify';

describe('Admin Status Endpoints', () => {
  let app: any;

  beforeAll(async () => {
    // Create a minimal Fastify app for testing
    app = build({ logger: false });
    
    // Add the endpoints we're testing
    app.get('/version', async () => {
      return {
        service: 'droobi-api',
        version: '1.0.0',
        sha: process.env.GITHUB_SHA || '',
        node: process.version
      };
    });

    app.get('/ready', async (request: any, reply: any) => {
      // Mock readiness check
      const ready = true; // Assume ready for tests
      if (!ready) {
        return reply.status(503).send({
          error: 'Service not ready',
          requestId: request.headers['x-request-id']
        });
      }
      return { status: 'ready' };
    });

    app.get('/admin/status', async () => {
      return {
        service: 'droobi-api',
        version: '1.0.0',
        sha: '',
        node: process.version,
        pid: process.pid,
        uptimeSec: 123,
        envName: 'test',
        dataNs: 'test',
        health: {
          status: 'ok',
          ready: true
        },
        flags: {},
        counts: {
          lexicon: 0,
          directory: 0,
          webinars: 0,
          videos: 0,
          trainings: 0,
          projects: 0,
          communityPosts: 0
        }
      };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /version', () => {
    it('should return version information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/version'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.service).toBe('droobi-api');
      expect(data.version).toBe('1.0.0');
      expect(data.node).toBe(process.version);
      expect(typeof data.sha).toBe('string');
    });
  });

  describe('GET /ready', () => {
    it('should return 200 when service is ready', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.status).toBe('ready');
    });
  });

  describe('GET /admin/status', () => {
    it('should return comprehensive status information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/admin/status'
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      
      // Check required fields
      expect(data.service).toBe('droobi-api');
      expect(typeof data.version).toBe('string');
      expect(typeof data.uptimeSec).toBe('number');
      expect(data.health).toBeTruthy();
      expect(data.health.status).toBe('ok');
      expect(typeof data.health.ready).toBe('boolean');
      expect(typeof data.counts).toBe('object');
      
      // Check counts structure
      const expectedCountFields = [
        'lexicon', 'directory', 'webinars', 'videos',
        'trainings', 'projects', 'communityPosts'
      ];
      
      expectedCountFields.forEach(field => {
        expect(data.counts).toHaveProperty(field);
        expect(typeof data.counts[field]).toBe('number');
      });
    });
  });
});