import { listWebinars, getWebinar, registerForWebinar } from '../webinars';

describe('Webinars API', () => {
  describe('listWebinars', () => {
    it('should return all upcoming webinars without filters', async () => {
      const webinars = await listWebinars();
      expect(webinars.length).toBeGreaterThan(0);
      expect(webinars[0]).toHaveProperty('id');
      expect(webinars[0]).toHaveProperty('title');
      expect(webinars[0]).toHaveProperty('startsAt');
    });

    it('should filter webinars by search query', async () => {
      const webinars = await listWebinars({ q: 'AI' });
      expect(webinars.length).toBeGreaterThan(0);
      expect(webinars[0].title).toContain('AI');
    });

    it('should return empty array for non-matching search', async () => {
      const webinars = await listWebinars({ q: 'nonexistent' });
      expect(webinars).toHaveLength(0);
    });
  });

  describe('getWebinar', () => {
    it('should return webinar for existing id', async () => {
      const webinar = await getWebinar('w1');
      expect(webinar).toBeTruthy();
      expect(webinar?.id).toBe('w1');
      expect(webinar?.title).toBe('AI for One Water – Kickoff');
    });

    it('should return null for non-existent id', async () => {
      const webinar = await getWebinar('unknown');
      expect(webinar).toBeNull();
    });
  });

  describe('registerForWebinar', () => {
    it('should register user for existing webinar', async () => {
      const registration = await registerForWebinar('w1', {
        name: 'Test User',
        email: 'test@example.com'
      });
      
      expect(registration).toBeTruthy();
      expect(registration?.webinarId).toBe('w1');
      expect(registration?.name).toBe('Test User');
      expect(registration?.email).toBe('test@example.com');
    });

    it('should return null for non-existent webinar', async () => {
      const registration = await registerForWebinar('unknown', {
        name: 'Test User',
        email: 'test@example.com'
      });
      
      expect(registration).toBeNull();
    });

    it('should return existing registration if already registered', async () => {
      // Register once
      const firstRegistration = await registerForWebinar('w2', {
        name: 'Test User 2',
        email: 'test2@example.com'
      });
      
      // Try to register again with same email
      const secondRegistration = await registerForWebinar('w2', {
        name: 'Test User 2 Updated',
        email: 'test2@example.com'
      });
      
      expect(firstRegistration?.id).toBe(secondRegistration?.id);
      expect(secondRegistration?.name).toBe('Test User 2'); // Original name preserved
    });
  });
});