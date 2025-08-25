import { getToday, getById, listHistory } from '../waterMinute';

describe('Water Minute API', () => {
  describe('getToday', () => {
    it('should return minute for exact date match', async () => {
      const minute = await getToday('2025-09-01');
      expect(minute).toBeTruthy();
      expect(minute?.id).toBe('wm-2025-09-01');
      expect(minute?.date).toBe('2025-09-01');
      expect(minute?.title).toBe('What is One Water?');
    });

    it('should return most recent past minute when no exact match', async () => {
      const minute = await getToday('2025-09-10');
      expect(minute).toBeTruthy();
      expect(minute?.id).toBe('wm-2025-09-03'); // Most recent
      expect(minute?.date).toBe('2025-09-03');
    });

    it('should return null when no minute available', async () => {
      const minute = await getToday('2025-08-01');
      expect(minute).toBeNull();
    });

    it('should use current date when no date provided', async () => {
      const minute = await getToday();
      // Should return most recent minute since current date is likely after seed dates
      expect(minute?.id).toBe('wm-2025-09-03');
    });
  });

  describe('getById', () => {
    it('should return minute for existing id', async () => {
      const minute = await getById('wm-2025-09-01');
      expect(minute).toBeTruthy();
      expect(minute?.title).toBe('What is One Water?');
      expect(minute?.mediaType).toBe('video');
      expect(minute?.url).toBe('https://storage.example.com/wm/one-water.mp4');
    });

    it('should return minute with text content', async () => {
      const minute = await getById('wm-2025-09-02');
      expect(minute).toBeTruthy();
      expect(minute?.title).toBe('CSO vs. SSO');
      expect(minute?.mediaType).toBe('text');
      expect(minute?.text).toContain('CSO combines storm + sanitary');
    });

    it('should return minute with link content', async () => {
      const minute = await getById('wm-2025-09-03');
      expect(minute).toBeTruthy();
      expect(minute?.title).toBe('PFAS at a glance');
      expect(minute?.mediaType).toBe('link');
      expect(minute?.url).toBe('https://example.com/brief/pfas');
    });

    it('should return null for non-existent id', async () => {
      const minute = await getById('unknown');
      expect(minute).toBeNull();
    });
  });

  describe('listHistory', () => {
    it('should return history sorted by date desc', async () => {
      const history = await listHistory();
      expect(history.length).toBe(3);
      expect(history[0].id).toBe('wm-2025-09-03'); // Most recent
      expect(history[1].id).toBe('wm-2025-09-02');
      expect(history[2].id).toBe('wm-2025-09-01');
    });

    it('should respect limit parameter', async () => {
      const history = await listHistory(2);
      expect(history.length).toBe(2);
      expect(history[0].id).toBe('wm-2025-09-03');
      expect(history[1].id).toBe('wm-2025-09-02');
    });

    it('should return items with required fields only', async () => {
      const history = await listHistory();
      history.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('tags');
        expect(item).not.toHaveProperty('summary');
        expect(item).not.toHaveProperty('mediaType');
        expect(item).not.toHaveProperty('url');
      });
    });

    it('should include tags in history items', async () => {
      const history = await listHistory();
      expect(history[0].tags).toEqual(['pfas', 'drinking-water']);
      expect(history[1].tags).toEqual(['wastewater', 'ops']);
      expect(history[2].tags).toEqual(['one-water', 'primer']);
    });
  });
});