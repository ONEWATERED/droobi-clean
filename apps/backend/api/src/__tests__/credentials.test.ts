import { listCredentials, addCredential, updateCredential, deleteCredential, getResume, setResume, getCard, setCard } from '../credentials';

describe('Credentials API', () => {
  describe('listCredentials', () => {
    it('should return credentials with computed status', async () => {
      const credentials = await listCredentials('u1');
      expect(credentials.length).toBeGreaterThan(0);
      expect(credentials[0]).toHaveProperty('status');
      expect(['active', 'expiringSoon', 'expired']).toContain(credentials[0].status);
    });

    it('should sort by expiresAt ascending', async () => {
      const credentials = await listCredentials('u1');
      if (credentials.length > 1) {
        const withExpiry = credentials.filter(c => c.expiresAt);
        if (withExpiry.length > 1) {
          expect(withExpiry[0].expiresAt! <= withExpiry[1].expiresAt!).toBe(true);
        }
      }
    });

    it('should return empty array for user with no credentials', async () => {
      const credentials = await listCredentials('unknown-user');
      expect(credentials).toHaveLength(0);
    });
  });

  describe('addCredential', () => {
    it('should create credential with valid data', async () => {
      const credentialData = {
        name: 'Test Certification',
        issuer: 'Test Board',
        licenseNo: 'TEST-123',
        issuedAt: '2024-01-01',
        expiresAt: '2026-01-01',
        notes: 'Test notes'
      };

      const credential = await addCredential('test-user', credentialData);
      
      expect(credential).toBeTruthy();
      expect(credential.name).toBe('Test Certification');
      expect(credential.issuer).toBe('Test Board');
      expect(credential.licenseNo).toBe('TEST-123');
      expect(credential.userId).toBe('test-user');
      expect(credential.id).toMatch(/^c-\d+$/);
      expect(credential.status).toBe('active');
    });

    it('should throw error for empty name', async () => {
      await expect(addCredential('test-user', {
        name: '   ',
        issuer: 'Test Board'
      })).rejects.toThrow('Name is required');
    });

    it('should handle optional fields', async () => {
      const credential = await addCredential('test-user-2', {
        name: 'Basic Cert'
      });
      
      expect(credential.name).toBe('Basic Cert');
      expect(credential.issuer).toBe('');
      expect(credential.licenseNo).toBe('');
      expect(credential.notes).toBe('');
    });
  });

  describe('updateCredential', () => {
    it('should update credential fields', async () => {
      // First create a credential
      const created = await addCredential('test-user-3', {
        name: 'Original Name',
        issuer: 'Original Issuer'
      });
      
      const updated = await updateCredential('test-user-3', created.id, {
        name: 'Updated Name',
        notes: 'Updated notes'
      });
      
      expect(updated).toBeTruthy();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.issuer).toBe('Original Issuer'); // Unchanged
      expect(updated?.notes).toBe('Updated notes');
    });

    it('should return null for non-existent credential', async () => {
      const result = await updateCredential('test-user', 'unknown-id', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should filter out system fields', async () => {
      const created = await addCredential('test-user-4', { name: 'Test Cred' });
      
      const updated = await updateCredential('test-user-4', created.id, {
        name: 'Updated Name',
        id: 'hacker-attempt', // Should be filtered out
        userId: 'hacker-user' // Should be filtered out
      } as any);
      
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.id).toBe(created.id); // Unchanged
      expect(updated?.userId).toBe('test-user-4'); // Unchanged
    });
  });

  describe('deleteCredential', () => {
    it('should delete existing credential', async () => {
      const created = await addCredential('test-user-5', { name: 'To Delete' });
      
      const success = await deleteCredential('test-user-5', created.id);
      expect(success).toBe(true);
      
      // Verify it's gone
      const credentials = await listCredentials('test-user-5');
      expect(credentials.find(c => c.id === created.id)).toBeUndefined();
    });

    it('should return false for non-existent credential', async () => {
      const success = await deleteCredential('test-user', 'unknown-id');
      expect(success).toBe(false);
    });
  });

  describe('getResume and setResume', () => {
    it('should get and set resume data', async () => {
      const resumeData = {
        url: 'https://example.com/resume.pdf',
        text: 'My resume text content'
      };

      const updated = await setResume('test-user-6', resumeData);
      expect(updated.url).toBe('https://example.com/resume.pdf');
      expect(updated.text).toBe('My resume text content');
      expect(updated.updatedAt).toBeGreaterThan(0);
      
      const retrieved = await getResume('test-user-6');
      expect(retrieved.url).toBe('https://example.com/resume.pdf');
      expect(retrieved.text).toBe('My resume text content');
    });

    it('should handle partial updates', async () => {
      await setResume('test-user-7', { url: 'https://example.com/old.pdf' });
      
      const updated = await setResume('test-user-7', { text: 'New text content' });
      expect(updated.url).toBe('https://example.com/old.pdf'); // Preserved
      expect(updated.text).toBe('New text content');
    });

    it('should return default resume for new user', async () => {
      const resume = await getResume('new-user');
      expect(resume.userId).toBe('new-user');
      expect(resume.url).toBe('');
      expect(resume.text).toBe('');
      expect(resume.updatedAt).toBe(0);
    });
  });

  describe('getCard and setCard', () => {
    it('should get and set business card data', async () => {
      const cardData = {
        name: 'Test User',
        title: 'Test Title',
        org: 'Test Org',
        email: 'test@example.com',
        phone: '555-1234',
        website: 'https://test.com',
        location: 'Test City'
      };

      const updated = await setCard('test-user-8', cardData);
      expect(updated.name).toBe('Test User');
      expect(updated.title).toBe('Test Title');
      expect(updated.org).toBe('Test Org');
      expect(updated.email).toBe('test@example.com');
      expect(updated.updatedAt).toBeGreaterThan(0);
      
      const retrieved = await getCard('test-user-8');
      expect(retrieved.name).toBe('Test User');
      expect(retrieved.email).toBe('test@example.com');
    });

    it('should handle partial updates', async () => {
      await setCard('test-user-9', { name: 'Original Name', email: 'original@example.com' });
      
      const updated = await setCard('test-user-9', { title: 'New Title' });
      expect(updated.name).toBe('Original Name'); // Preserved
      expect(updated.email).toBe('original@example.com'); // Preserved
      expect(updated.title).toBe('New Title');
    });

    it('should return default card for new user', async () => {
      const card = await getCard('new-user-card');
      expect(card.userId).toBe('new-user-card');
      expect(card.name).toBe('');
      expect(card.updatedAt).toBe(0);
    });

    it('should filter out system fields', async () => {
      const updated = await setCard('test-user-10', {
        name: 'Valid Name',
        userId: 'hacker-attempt', // Should be filtered out
        updatedAt: 999999 // Should be filtered out
      } as any);
      
      expect(updated.name).toBe('Valid Name');
      expect(updated.userId).toBe('test-user-10'); // Unchanged
      expect(updated.updatedAt).not.toBe(999999); // Should be current timestamp
    });
  });
});