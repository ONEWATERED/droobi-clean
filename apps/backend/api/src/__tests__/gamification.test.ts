import { getPoints, addPoints, listLeaderboard, listBadges, listMyBadges, logEvent } from '../gamification';

describe('Gamification API', () => {
  describe('getPoints', () => {
    it('should return 0 for user with no points', async () => {
      const points = await getPoints('new-user');
      expect(points).toBe(0);
    });

    it('should return correct points after adding', async () => {
      await addPoints('test-user-1', 50);
      const points = await getPoints('test-user-1');
      expect(points).toBe(50);
    });
  });

  describe('addPoints', () => {
    it('should add points to new user', async () => {
      const newTotal = await addPoints('test-user-2', 25);
      expect(newTotal).toBe(25);
    });

    it('should add points to existing user', async () => {
      await addPoints('test-user-3', 10);
      const newTotal = await addPoints('test-user-3', 15);
      expect(newTotal).toBe(25);
    });

    it('should handle negative points', async () => {
      await addPoints('test-user-4', 20);
      const newTotal = await addPoints('test-user-4', -5);
      expect(newTotal).toBe(15);
    });
  });

  describe('listLeaderboard', () => {
    it('should return leaderboard sorted by points desc', async () => {
      // Add points for multiple users
      await addPoints('leader-1', 100);
      await addPoints('leader-2', 150);
      await addPoints('leader-3', 75);
      
      const leaderboard = await listLeaderboard(10);
      expect(leaderboard.length).toBeGreaterThan(0);
      
      // Should be sorted by points desc
      if (leaderboard.length > 1) {
        expect(leaderboard[0].points).toBeGreaterThanOrEqual(leaderboard[1].points);
      }
    });

    it('should respect limit parameter', async () => {
      const leaderboard = await listLeaderboard(2);
      expect(leaderboard.length).toBeLessThanOrEqual(2);
    });

    it('should handle ties by userId', async () => {
      await addPoints('tie-user-a', 50);
      await addPoints('tie-user-b', 50);
      
      const leaderboard = await listLeaderboard(10);
      const tiedUsers = leaderboard.filter(entry => entry.points === 50);
      
      if (tiedUsers.length > 1) {
        expect(tiedUsers[0].userId.localeCompare(tiedUsers[1].userId)).toBeLessThan(0);
      }
    });
  });

  describe('listBadges', () => {
    it('should return all available badges', async () => {
      const badges = await listBadges();
      expect(badges.length).toBe(3);
      expect(badges[0].id).toBe('b1');
      expect(badges[0].name).toBe('Early Adopter');
    });
  });

  describe('listMyBadges', () => {
    it('should return empty array for user with no qualifying events', async () => {
      const badges = await listMyBadges('no-events-user');
      expect(badges).toHaveLength(0);
    });

    it('should award Early Adopter badge after 5 events', async () => {
      const userId = 'badge-test-user-1';
      
      // Log 5 different events
      await logEvent(userId, 'webinar.registered', 'w1');
      await logEvent(userId, 'projects.saved', 'p1');
      await logEvent(userId, 'community.posted', 'c1');
      await logEvent(userId, 'comment.posted', 'cm1');
      await logEvent(userId, 'module.visited', 'lexicon');
      
      const badges = await listMyBadges(userId);
      expect(badges.some(b => b.id === 'b1')).toBe(true);
    });

    it('should award Contributor badge after 3 comments', async () => {
      const userId = 'badge-test-user-2';
      
      // Log 3 comment events
      await logEvent(userId, 'comment.posted', 'cm1');
      await logEvent(userId, 'comment.posted', 'cm2');
      await logEvent(userId, 'comment.posted', 'cm3');
      
      const badges = await listMyBadges(userId);
      expect(badges.some(b => b.id === 'b2')).toBe(true);
    });

    it('should award Explorer badge after visiting 5 modules', async () => {
      const userId = 'badge-test-user-3';
      
      // Log 5 different module visits
      await logEvent(userId, 'module.visited', 'lexicon');
      await logEvent(userId, 'module.visited', 'directory');
      await logEvent(userId, 'module.visited', 'profiles');
      await logEvent(userId, 'module.visited', 'projects');
      await logEvent(userId, 'module.visited', 'community');
      
      const badges = await listMyBadges(userId);
      expect(badges.some(b => b.id === 'b3')).toBe(true);
    });
  });

  describe('logEvent', () => {
    it('should create event and award points for webinar registration', async () => {
      const userId = 'event-test-user-1';
      const initialPoints = await getPoints(userId);
      
      const event = await logEvent(userId, 'webinar.registered', 'w1');
      
      expect(event).toBeTruthy();
      expect(event.type).toBe('webinar.registered');
      expect(event.refId).toBe('w1');
      expect(event.userId).toBe(userId);
      
      const newPoints = await getPoints(userId);
      expect(newPoints).toBe(initialPoints + 10);
    });

    it('should create event and award points for project save', async () => {
      const userId = 'event-test-user-2';
      const initialPoints = await getPoints(userId);
      
      await logEvent(userId, 'projects.saved', 'p1');
      
      const newPoints = await getPoints(userId);
      expect(newPoints).toBe(initialPoints + 5);
    });

    it('should create event and award points for community post', async () => {
      const userId = 'event-test-user-3';
      const initialPoints = await getPoints(userId);
      
      await logEvent(userId, 'community.posted', 'c1');
      
      const newPoints = await getPoints(userId);
      expect(newPoints).toBe(initialPoints + 8);
    });

    it('should create event and award points for comment', async () => {
      const userId = 'event-test-user-4';
      const initialPoints = await getPoints(userId);
      
      await logEvent(userId, 'comment.posted', 'cm1');
      
      const newPoints = await getPoints(userId);
      expect(newPoints).toBe(initialPoints + 3);
    });

    it('should create event without points for unknown type', async () => {
      const userId = 'event-test-user-5';
      const initialPoints = await getPoints(userId);
      
      const event = await logEvent(userId, 'unknown.type', 'ref1');
      
      expect(event).toBeTruthy();
      expect(event.type).toBe('unknown.type');
      
      const newPoints = await getPoints(userId);
      expect(newPoints).toBe(initialPoints); // No points awarded
    });
  });
});