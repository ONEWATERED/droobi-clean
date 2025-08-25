import { getAppSettings, setAppSettings, getPublicAppSettings } from '../appSettings';

describe('App Settings API', () => {
  describe('getAppSettings', () => {
    it('should return app settings with all fields', async () => {
      const settings = await getAppSettings();
      expect(settings).toBeTruthy();
      expect(settings.brandName).toBe('Droobi');
      expect(settings.brandTagline).toBe('One Water. One Platform.');
      expect(settings.supportEmail).toBe('support@example.com');
      expect(settings.social).toBeTruthy();
      expect(settings.footerLinks).toBeTruthy();
      expect(Array.isArray(settings.footerLinks)).toBe(true);
    });

    it('should include social media settings', async () => {
      const settings = await getAppSettings();
      expect(settings.social).toHaveProperty('x');
      expect(settings.social).toHaveProperty('linkedin');
      expect(settings.social).toHaveProperty('youtube');
    });

    it('should include footer links array', async () => {
      const settings = await getAppSettings();
      expect(Array.isArray(settings.footerLinks)).toBe(true);
      expect(settings.footerLinks.length).toBeGreaterThan(0);
      expect(settings.footerLinks[0]).toHaveProperty('label');
      expect(settings.footerLinks[0]).toHaveProperty('href');
    });
  });

  describe('setAppSettings', () => {
    it('should update brand settings', async () => {
      const originalSettings = await getAppSettings();
      
      const patch = { 
        brandName: 'Updated Brand',
        brandTagline: 'Updated Tagline'
      };
      const updatedSettings = await setAppSettings(patch);
      
      expect(updatedSettings.brandName).toBe('Updated Brand');
      expect(updatedSettings.brandTagline).toBe('Updated Tagline');
      expect(updatedSettings.supportEmail).toBe(originalSettings.supportEmail); // Unchanged
      
      // Verify persistence
      const reloadedSettings = await getAppSettings();
      expect(reloadedSettings.brandName).toBe('Updated Brand');
      
      // Reset for other tests
      await setAppSettings({ 
        brandName: originalSettings.brandName,
        brandTagline: originalSettings.brandTagline
      });
    });

    it('should merge social media settings', async () => {
      const originalSettings = await getAppSettings();
      
      const patch = {
        social: {
          x: 'https://x.com/test',
          linkedin: 'https://linkedin.com/company/test'
        }
      };
      const updatedSettings = await setAppSettings(patch);
      
      expect(updatedSettings.social.x).toBe('https://x.com/test');
      expect(updatedSettings.social.linkedin).toBe('https://linkedin.com/company/test');
      expect(updatedSettings.social.youtube).toBe(originalSettings.social.youtube); // Preserved
      
      // Reset
      await setAppSettings({ social: originalSettings.social });
    });

    it('should update footer links', async () => {
      const originalSettings = await getAppSettings();
      
      const patch = {
        footerLinks: [
          { label: 'New Link', href: '/new' },
          { label: 'Another Link', href: '/another' }
        ]
      };
      const updatedSettings = await setAppSettings(patch);
      
      expect(updatedSettings.footerLinks).toHaveLength(2);
      expect(updatedSettings.footerLinks[0].label).toBe('New Link');
      expect(updatedSettings.footerLinks[1].href).toBe('/another');
      
      // Reset
      await setAppSettings({ footerLinks: originalSettings.footerLinks });
    });

    it('should update about HTML content', async () => {
      const originalSettings = await getAppSettings();
      
      const patch = {
        aboutHtml: '<p>Updated about content with <strong>bold text</strong>.</p>'
      };
      const updatedSettings = await setAppSettings(patch);
      
      expect(updatedSettings.aboutHtml).toBe('<p>Updated about content with <strong>bold text</strong>.</p>');
      
      // Reset
      await setAppSettings({ aboutHtml: originalSettings.aboutHtml });
    });
  });

  describe('getPublicAppSettings', () => {
    it('should return public settings with same structure as full settings', async () => {
      const publicSettings = await getPublicAppSettings();
      const fullSettings = await getAppSettings();
      
      expect(publicSettings.brandName).toBe(fullSettings.brandName);
      expect(publicSettings.brandTagline).toBe(fullSettings.brandTagline);
      expect(publicSettings.supportEmail).toBe(fullSettings.supportEmail);
      expect(publicSettings.social).toEqual(fullSettings.social);
      expect(publicSettings.footerLinks).toEqual(fullSettings.footerLinks);
    });

    it('should include all expected public fields', async () => {
      const publicSettings = await getPublicAppSettings();
      
      expect(publicSettings).toHaveProperty('brandName');
      expect(publicSettings).toHaveProperty('brandTagline');
      expect(publicSettings).toHaveProperty('logoUrl');
      expect(publicSettings).toHaveProperty('supportEmail');
      expect(publicSettings).toHaveProperty('privacyUrl');
      expect(publicSettings).toHaveProperty('termsUrl');
      expect(publicSettings).toHaveProperty('social');
      expect(publicSettings).toHaveProperty('footerLinks');
      expect(publicSettings).toHaveProperty('aboutHtml');
    });
  });
});