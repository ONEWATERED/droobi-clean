import { listVideos, getVideo, createVideo } from '../videos';

describe('Videos API', () => {
  describe('listVideos', () => {
    it('should return all videos without filters', async () => {
      const videos = await listVideos();
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0]).toHaveProperty('id');
      expect(videos[0]).toHaveProperty('title');
      expect(videos[0]).toHaveProperty('url');
    });

    it('should filter videos by search query', async () => {
      const videos = await listVideos({ q: 'Welcome' });
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0].title).toContain('Welcome');
    });

    it('should filter videos by tag', async () => {
      const videos = await listVideos({ tag: 'intro' });
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0].tags).toContain('intro');
    });

    it('should return empty array for non-matching search', async () => {
      const videos = await listVideos({ q: 'nonexistent' });
      expect(videos).toHaveLength(0);
    });

    it('should sort videos by publishedAt desc', async () => {
      const videos = await listVideos();
      if (videos.length > 1) {
        const firstDate = new Date(videos[0].publishedAt);
        const secondDate = new Date(videos[1].publishedAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('getVideo', () => {
    it('should return video for existing id', async () => {
      const video = await getVideo('v1');
      expect(video).toBeTruthy();
      expect(video?.id).toBe('v1');
      expect(video?.title).toBe('Welcome to Droobi TV');
    });

    it('should return null for non-existent id', async () => {
      const video = await getVideo('unknown');
      expect(video).toBeNull();
    });
  });

  describe('createVideo', () => {
    it('should create video with provided data', async () => {
      const videoData = {
        title: 'Test Video',
        description: 'Test description',
        url: 'https://example.com/test.mp4',
        tags: ['test'],
        durationSec: 120
      };

      const video = await createVideo(videoData);
      
      expect(video).toBeTruthy();
      expect(video.title).toBe('Test Video');
      expect(video.description).toBe('Test description');
      expect(video.url).toBe('https://example.com/test.mp4');
      expect(video.tags).toEqual(['test']);
      expect(video.durationSec).toBe(120);
      expect(video.id).toMatch(/^v-\d+$/);
    });

    it('should generate ID if not provided', async () => {
      const videoData = {
        title: 'Auto ID Video',
        description: 'Test description',
        url: 'https://example.com/auto.mp4',
        tags: [],
        durationSec: 60
      };

      const video = await createVideo(videoData);
      
      expect(video.id).toMatch(/^v-\d+$/);
    });

    it('should use provided ID if given', async () => {
      const videoData = {
        id: 'custom-id',
        title: 'Custom ID Video',
        description: 'Test description',
        url: 'https://example.com/custom.mp4',
        tags: [],
        durationSec: 60
      };

      const video = await createVideo(videoData);
      
      expect(video.id).toBe('custom-id');
    });
  });
});