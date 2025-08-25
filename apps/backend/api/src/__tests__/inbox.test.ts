import { listNotifications, markRead, createNotification } from '../inbox';

describe('Inbox API', () => {
  describe('listNotifications', () => {
    it('should return notifications for user sorted by createdAt desc', async () => {
      const notifications = await listNotifications('u1');
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0]).toHaveProperty('id');
      expect(notifications[0]).toHaveProperty('title');
      expect(notifications[0]).toHaveProperty('body');
      expect(notifications[0]).toHaveProperty('createdAt');
      
      // Should be sorted by createdAt desc (newest first)
      if (notifications.length > 1) {
        expect(notifications[0].createdAt).toBeGreaterThanOrEqual(notifications[1].createdAt);
      }
    });

    it('should return empty array for user with no notifications', async () => {
      const notifications = await listNotifications('unknown-user');
      expect(notifications).toHaveLength(0);
    });

    it('should only return notifications for specified user', async () => {
      const notifications = await listNotifications('u1');
      notifications.forEach(notification => {
        expect(notification.userId).toBe('u1');
      });
    });
  });

  describe('markRead', () => {
    it('should mark notification as read for correct user', async () => {
      // First get a notification
      const notifications = await listNotifications('u1');
      const unreadNotification = notifications.find(n => n.readAt === null);
      
      if (unreadNotification) {
        const success = await markRead('u1', unreadNotification.id);
        expect(success).toBe(true);
        
        // Verify it was marked as read
        const updatedNotifications = await listNotifications('u1');
        const markedNotification = updatedNotifications.find(n => n.id === unreadNotification.id);
        expect(markedNotification?.readAt).not.toBeNull();
      }
    });

    it('should return false for non-existent notification', async () => {
      const success = await markRead('u1', 'non-existent-id');
      expect(success).toBe(false);
    });

    it('should return false when user does not own notification', async () => {
      const notifications = await listNotifications('u1');
      if (notifications.length > 0) {
        const success = await markRead('different-user', notifications[0].id);
        expect(success).toBe(false);
      }
    });
  });

  describe('createNotification', () => {
    it('should create notification with valid data', async () => {
      const notificationData = {
        userId: 'test-user',
        type: 'test.notification',
        title: 'Test Notification',
        body: 'This is a test notification body.'
      };

      const notification = await createNotification(notificationData);
      
      expect(notification).toBeTruthy();
      expect(notification.title).toBe('Test Notification');
      expect(notification.body).toBe('This is a test notification body.');
      expect(notification.userId).toBe('test-user');
      expect(notification.type).toBe('test.notification');
      expect(notification.readAt).toBeNull();
      expect(notification.id).toMatch(/^n-\d+/);
    });

    it('should throw error for empty title', async () => {
      await expect(createNotification({
        userId: 'test-user',
        type: 'test',
        title: '   ',
        body: 'Valid body'
      })).rejects.toThrow('Title is required');
    });

    it('should throw error for empty body', async () => {
      await expect(createNotification({
        userId: 'test-user',
        type: 'test',
        title: 'Valid title',
        body: '   '
      })).rejects.toThrow('Body is required');
    });

    it('should trim whitespace from title and body', async () => {
      const notification = await createNotification({
        userId: 'test-user',
        type: 'test',
        title: '  Test Title  ',
        body: '  Test Body  '
      });
      
      expect(notification.title).toBe('Test Title');
      expect(notification.body).toBe('Test Body');
    });
  });
});