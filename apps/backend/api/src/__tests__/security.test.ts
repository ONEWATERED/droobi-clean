import { build } from 'fastify';
import { createCorsOptions } from '../security/cors';
import { validateRequest, webinarRegistrationSchema, communityPostSchema } from '../security/validation';

describe('Security', () => {
  describe('CORS Configuration', () => {
    it('should allow origins from ALLOWED_ORIGINS', () => {
      process.env.ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';
      
      const corsOptions = createCorsOptions();
      
      // Test allowed origin
      corsOptions.origin('https://example.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
      
      // Test disallowed origin
      corsOptions.origin('https://malicious.com', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(false);
      });
      
      // Cleanup
      delete process.env.ALLOWED_ORIGINS;
    });

    it('should allow localhost in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const corsOptions = createCorsOptions();
      
      corsOptions.origin('http://localhost:3000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should allow requests with no origin', () => {
      const corsOptions = createCorsOptions();
      
      corsOptions.origin(undefined, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
      });
    });
  });

  describe('Request Validation', () => {
    it('should validate webinar registration data', () => {
      const validData = { name: 'John Doe', email: 'john@example.com' };
      const result = validateRequest(webinarRegistrationSchema, validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = { name: 'John Doe', email: 'invalid-email' };
      const result = validateRequest(webinarRegistrationSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid email format');
      }
    });

    it('should reject empty name', () => {
      const invalidData = { name: '', email: 'john@example.com' };
      const result = validateRequest(webinarRegistrationSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Name is required');
      }
    });

    it('should validate community post data', () => {
      const validData = { 
        title: 'Test Post', 
        body: 'This is a test post body.',
        tags: ['test', 'example']
      };
      const result = validateRequest(communityPostSchema, validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Post');
        expect(result.data.tags).toEqual(['test', 'example']);
      }
    });

    it('should reject too many tags', () => {
      const invalidData = { 
        title: 'Test Post', 
        body: 'Test body',
        tags: Array(15).fill('tag') // More than 10 tags
      };
      const result = validateRequest(communityPostSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many tags');
      }
    });

    it('should reject long title', () => {
      const invalidData = { 
        title: 'A'.repeat(250), // Too long
        body: 'Test body'
      };
      const result = validateRequest(communityPostSchema, invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Title too long');
      }
    });
  });
});