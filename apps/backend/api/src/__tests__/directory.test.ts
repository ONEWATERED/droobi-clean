import { listOrgs, getOrg } from '../directory';

describe('Directory API', () => {
  describe('listOrgs', () => {
    it('should return all organizations without filters', async () => {
      const orgs = await listOrgs();
      expect(orgs).toHaveLength(2);
      expect(orgs[0].slug).toBe('acme-filtration');
      expect(orgs[1].slug).toBe('city-water');
    });

    it('should filter by type', async () => {
      const orgs = await listOrgs({ type: 'vendor' });
      expect(orgs).toHaveLength(1);
      expect(orgs[0].slug).toBe('acme-filtration');
    });

    it('should filter by category', async () => {
      const orgs = await listOrgs({ category: 'Water Utility' });
      expect(orgs).toHaveLength(1);
      expect(orgs[0].slug).toBe('city-water');
    });

    it('should filter by region', async () => {
      const orgs = await listOrgs({ region: 'US-SE' });
      expect(orgs).toHaveLength(2);
    });

    it('should search by name', async () => {
      const orgs = await listOrgs({ q: 'Acme' });
      expect(orgs).toHaveLength(1);
      expect(orgs[0].slug).toBe('acme-filtration');
    });

    it('should search by about text', async () => {
      const orgs = await listOrgs({ q: 'utility' });
      expect(orgs).toHaveLength(1);
      expect(orgs[0].slug).toBe('city-water');
    });
  });

  describe('getOrg', () => {
    it('should return organization by slug', async () => {
      const org = await getOrg('acme-filtration');
      expect(org).toBeTruthy();
      expect(org?.name).toBe('Acme Filtration');
      expect(org?.type).toBe('vendor');
    });

    it('should return null for non-existent slug', async () => {
      const org = await getOrg('non-existent');
      expect(org).toBeNull();
    });
  });
});