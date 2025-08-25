import { getProfile, updateProfile } from '../profiles';

describe('Profiles API', () => {
  describe('getProfile', () => {
    it('should return profile for existing user', async () => {
      const profile = await getProfile('u1');
      expect(profile).toBeTruthy();
      expect(profile?.id).toBe('u1');
      expect(profile?.name).toBe('Demo User');
      expect(profile?.title).toBe('Project Manager');
    });

    it('should return null for non-existent user', async () => {
      const profile = await getProfile('unknown');
      expect(profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      const updatedProfile = await updateProfile('u1', {
        title: 'Senior Project Manager'
      });
      
      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile?.title).toBe('Senior Project Manager');
      
      // Verify the change persisted
      const profile = await getProfile('u1');
      expect(profile?.title).toBe('Senior Project Manager');
      
      // Reset for other tests
      await updateProfile('u1', {
        title: 'Project Manager'
      });
    });

    it('should return null for non-existent user', async () => {
      const result = await updateProfile('unknown', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should filter out disallowed fields', async () => {
      const updatedProfile = await updateProfile('u1', {
        name: 'Updated Name',
        id: 'hacker-attempt', // This should be filtered out
        orgId: 'hacker-org' // This should be filtered out
      } as any);
      
      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile?.name).toBe('Updated Name');
      expect(updatedProfile?.id).toBe('u1'); // Should remain unchanged
      expect(updatedProfile?.orgId).toBe('demo'); // Should remain unchanged
      
      // Reset
      await updateProfile('u1', { name: 'Demo User' });
    });
  });
});