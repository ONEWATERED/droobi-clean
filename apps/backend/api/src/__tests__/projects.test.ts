import { listProjects, getProject, saveProject, listSaved } from '../projects';

describe('Projects API', () => {
  describe('listProjects', () => {
    it('should return all projects without filters', async () => {
      const projects = await listProjects();
      expect(projects).toHaveLength(3);
      expect(projects[0].id).toBe('p2'); // Should be sorted by publishedAt desc
      expect(projects[1].id).toBe('p1');
      expect(projects[2].id).toBe('p3');
    });

    it('should filter by search query', async () => {
      const projects = await listProjects({ q: 'PFAS' });
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('p2');
    });

    it('should filter by source', async () => {
      const projects = await listProjects({ source: 'SAM.gov' });
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('p1');
    });

    it('should filter by status', async () => {
      const projects = await listProjects({ status: 'open' });
      expect(projects).toHaveLength(2);
    });

    it('should filter by category', async () => {
      const projects = await listProjects({ category: 'Wastewater' });
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('p1');
    });

    it('should filter by region', async () => {
      const projects = await listProjects({ region: 'US-SE' });
      expect(projects).toHaveLength(2);
    });

    it('should filter by due date', async () => {
      const projects = await listProjects({ dueBefore: '2025-09-30T00:00:00Z' });
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('p2');
    });
  });

  describe('getProject', () => {
    it('should return project for existing id', async () => {
      const project = await getProject('p1');
      expect(project).toBeTruthy();
      expect(project?.title).toBe('Lift Station Upgrades – Phase 2');
      expect(project?.buyer).toBe('City of Example');
    });

    it('should return null for non-existent id', async () => {
      const project = await getProject('unknown');
      expect(project).toBeNull();
    });
  });

  describe('saveProject', () => {
    it('should save project for first time', async () => {
      const result = await saveProject({ userId: 'test-user', projectId: 'p1' });
      expect(result.isNew).toBe(true);
      expect(result.saved.userId).toBe('test-user');
      expect(result.saved.projectId).toBe('p1');
    });

    it('should return existing save on duplicate', async () => {
      // Save once
      const first = await saveProject({ userId: 'test-user-2', projectId: 'p2' });
      
      // Save again
      const second = await saveProject({ userId: 'test-user-2', projectId: 'p2' });
      
      expect(first.isNew).toBe(true);
      expect(second.isNew).toBe(false);
      expect(first.saved.id).toBe(second.saved.id);
    });
  });

  describe('listSaved', () => {
    it('should return saved projects for user', async () => {
      // Save a project first
      await saveProject({ userId: 'test-user-3', projectId: 'p3' });
      
      const saved = await listSaved('test-user-3');
      expect(saved.length).toBeGreaterThan(0);
      expect(saved.some(s => s.projectId === 'p3')).toBe(true);
    });

    it('should return empty array for user with no saved projects', async () => {
      const saved = await listSaved('unknown-user');
      expect(saved).toHaveLength(0);
    });
  });
});