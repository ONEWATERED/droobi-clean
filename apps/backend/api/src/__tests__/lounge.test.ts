import { listRooms, getRoom, listMessages, postMessage } from '../lounge';

describe('Lounge API', () => {
  describe('listRooms', () => {
    it('should return all rooms', async () => {
      const rooms = await listRooms();
      expect(rooms.length).toBeGreaterThan(0);
      expect(rooms[0]).toHaveProperty('id');
      expect(rooms[0]).toHaveProperty('name');
      expect(rooms[0]).toHaveProperty('description');
    });
  });

  describe('getRoom', () => {
    it('should return room for existing id', async () => {
      const room = await getRoom('r1');
      expect(room).toBeTruthy();
      expect(room?.id).toBe('r1');
      expect(room?.name).toBe('General Lounge');
    });

    it('should return null for non-existent id', async () => {
      const room = await getRoom('unknown');
      expect(room).toBeNull();
    });
  });

  describe('listMessages', () => {
    it('should return empty array for room with no messages', async () => {
      const messages = await listMessages('r1');
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should filter messages by sinceEpochMs', async () => {
      // First post a message
      await postMessage('r1', { userId: 'test-user', text: 'Hello world' });
      
      const now = Date.now();
      const messages = await listMessages('r1', now + 1000); // Future timestamp
      expect(messages).toHaveLength(0);
    });
  });

  describe('postMessage', () => {
    it('should create message for existing room', async () => {
      const message = await postMessage('r1', {
        userId: 'test-user',
        text: 'Hello from test'
      });
      
      expect(message).toBeTruthy();
      expect(message.roomId).toBe('r1');
      expect(message.userId).toBe('test-user');
      expect(message.text).toBe('Hello from test');
      expect(message.createdAt).toBeGreaterThan(0);
    });

    it('should throw error for non-existent room', async () => {
      await expect(postMessage('unknown', {
        userId: 'test-user',
        text: 'Hello'
      })).rejects.toThrow('Room not found');
    });

    it('should throw error for empty text', async () => {
      await expect(postMessage('r1', {
        userId: 'test-user',
        text: '   '
      })).rejects.toThrow('Message text cannot be empty');
    });

    it('should trim whitespace from text', async () => {
      const message = await postMessage('r1', {
        userId: 'test-user',
        text: '  Hello with spaces  '
      });
      
      expect(message.text).toBe('Hello with spaces');
    });
  });
});