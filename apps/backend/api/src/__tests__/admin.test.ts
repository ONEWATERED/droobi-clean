import { getFlags, setFlags, getUserSettings, setUserSettings } from '../admin';

describe('Admin API', () => {
  describe('getFlags', () => {
    it('should return feature flags', async () => {
      const flags = await getFlags();
      expect(flags).toBeTruthy();
      expect(typeof flags.lexicon).toBe('boolean');
      expect(typeof flags.directory).toBe('boolean');
      expect(typeof flags.profiles).toBe('boolean');
    });

    it('should include all expected flag keys', async () => {
      const flags = await getFlags();
      const expectedKeys = [
        'lexicon', 'directory', 'microsites', 'profiles',
        'webinars', 'tv', 'trainings', 'projects',
        'lounge', 'community', 'inbox', 'gamification',
        'quiz', 'waterMinute', 'credentials'
      ];
      
      expectedKeys.forEach(key => {
        expect(flags).toHaveProperty(key);
        expect(typeof flags[key as keyof typeof flags]).toBe('boolean');
      });
    });
  });

  describe('setFlags', () => {
    it('should update feature flags', async () => {
      const originalFlags = await getFlags();
      
      const patch = { lexicon: !originalFlags.lexicon };
      const updatedFlags = await setFlags(patch);
      
      expect(updatedFlags.lexicon).toBe(!originalFlags.lexicon);
      
      // Verify persistence
      const reloadedFlags = await getFlags();
      expect(reloadedFlags.lexicon).toBe(!originalFlags.lexicon);
      
      // Reset for other tests
      await setFlags({ lexicon: originalFlags.lexicon });
    });

    it('should merge partial updates', async () => {
      const originalFlags = await getFlags();
      
      const patch = { community: true, inbox: false };
      const updatedFlags = await setFlags(patch);
      
      expect(updatedFlags.community).toBe(true);
      expect(updatedFlags.inbox).toBe(false);
      expect(updatedFlags.lexicon).toBe(originalFlags.lexicon); // Unchanged
      
      // Reset
      await setFlags({ community: originalFlags.community, inbox: originalFlags.inbox });
    });
  });

  describe('getUserSettings', () => {
    it('should return settings for existing user', async () => {
      const settings = await getUserSettings('u1');
      expect(settings).toBeTruthy();
      expect(settings.userId).toBe('u1');
      expect(settings.timezone).toBe('America/New_York');
      expect(settings.emailAlerts).toBe(true);
    });

    it('should return default settings for new user', async () => {
      const settings = await getUserSettings('new-user');
      expect(settings).toBeTruthy();
      expect(settings.userId).toBe('new-user');
      expect(settings.timezone).toBe('America/New_York');
      expect(settings.emailAlerts).toBe(true);
    });
  });

  describe('setUserSettings', () => {
    it('should update existing user settings', async () => {
      const updatedSettings = await setUserSettings('u1', {
        timezone: 'America/Los_Angeles',
        emailAlerts: false
      });
      
      expect(updatedSettings.timezone).toBe('America/Los_Angeles');
      expect(updatedSettings.emailAlerts).toBe(false);
      expect(updatedSettings.userId).toBe('u1');
      
      // Verify persistence
      const reloadedSettings = await getUserSettings('u1');
      expect(reloadedSettings.timezone).toBe('America/Los_Angeles');
      expect(reloadedSettings.emailAlerts).toBe(false);
      
      // Reset for other tests
      await setUserSettings('u1', {
        timezone: 'America/New_York',
        emailAlerts: true
      });
    });

    it('should create settings for new user', async () => {
      const newSettings = await setUserSettings('test-user', {
        timezone: 'UTC',
        emailAlerts: false
      });
      
      expect(newSettings.userId).toBe('test-user');
      expect(newSettings.timezone).toBe('UTC');
      expect(newSettings.emailAlerts).toBe(false);
      
      // Verify it was created
      const retrievedSettings = await getUserSettings('test-user');
      expect(retrievedSettings.timezone).toBe('UTC');
      expect(retrievedSettings.emailAlerts).toBe(false);
    });

    it('should handle partial updates', async () => {
      // Set initial settings
      await setUserSettings('partial-user', {
        timezone: 'America/Chicago',
        emailAlerts: true
      });
      
      // Update only timezone
      const updatedSettings = await setUserSettings('partial-user', {
        timezone: 'Europe/London'
      });
      
      expect(updatedSettings.timezone).toBe('Europe/London');
      expect(updatedSettings.emailAlerts).toBe(true); // Preserved
    });

    it('should preserve userId in updates', async () => {
      const updatedSettings = await setUserSettings('preserve-test', {
        timezone: 'Asia/Tokyo'
      });
      
      expect(updatedSettings.userId).toBe('preserve-test');
    });
  });
});