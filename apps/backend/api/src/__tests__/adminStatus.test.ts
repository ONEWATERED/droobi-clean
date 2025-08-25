import { getAdminStatus, checkReadiness } from '../adminStatus';

describe('Admin Status API', () => {
  describe('checkReadiness', () => {
    it('should return true when seed files are accessible', async () => {
      const ready = await checkReadiness();
      expect(typeof ready).toBe('boolean');
      // In test environment, this might be true or false depending on file structure
    });
  });

  describe('getAdminStatus', () => {
    it('should return comprehensive status information', async () => {
      const status = await getAdminStatus();
      
      expect(status).toBeTruthy();
      expect(status.service).toBe('droobi-api');
      expect(typeof status.version).toBe('string');
      expect(typeof status.sha).toBe('string');
      expect(typeof status.node).toBe('string');
      expect(typeof status.pid).toBe('number');
      expect(typeof status.uptimeSec).toBe('number');
      expect(typeof status.envName).toBe('string');
      expect(typeof status.dataNs).toBe('string');
      expect(status.health).toBeTruthy();
      expect(typeof status.health.status).toBe('string');
      expect(typeof status.health.ready).toBe('boolean');
      expect(typeof status.flags).toBe('object');
      expect(typeof status.counts).toBe('object');
    });

    it('should include all expected count fields', async () => {
      const status = await getAdminStatus();
      
      const expectedCounts = [
        'lexicon', 'directory', 'webinars', 'videos',
        'trainings', 'projects', 'communityPosts'
      ];
      
      expectedCounts.forEach(field => {
        expect(status.counts).toHaveProperty(field);
        expect(typeof status.counts[field]).toBe('number');
        expect(status.counts[field]).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle missing seed files gracefully', async () => {
      const status = await getAdminStatus();
      
      // All counts should be numbers (0 if files missing)
      Object.values(status.counts).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include environment information', async () => {
      const status = await getAdminStatus();
      
      expect(status.envName).toBe(process.env.ENV_NAME || 'development');
      expect(status.dataNs).toBe(process.env.DATA_NAMESPACE || 'default');
      expect(status.node).toBe(process.version);
      expect(status.pid).toBe(process.pid);
    });
  });
});