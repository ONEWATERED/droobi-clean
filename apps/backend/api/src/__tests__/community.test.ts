import { listPosts, getPost, createPost, listComments, addComment } from '../community';

describe('Community API', () => {
  describe('listPosts', () => {
    it('should return all posts without filters', async () => {
      const posts = await listPosts();
      expect(posts.length).toBeGreaterThan(0);
      expect(posts[0]).toHaveProperty('id');
      expect(posts[0]).toHaveProperty('title');
      expect(posts[0]).toHaveProperty('body');
    });

    it('should filter posts by search query', async () => {
      const posts = await listPosts({ q: 'Welcome' });
      expect(posts.length).toBeGreaterThan(0);
      expect(posts[0].title).toContain('Welcome');
    });

    it('should filter posts by tag', async () => {
      const posts = await listPosts({ tag: 'intro' });
      expect(posts.length).toBeGreaterThan(0);
      expect(posts[0].tags).toContain('intro');
    });

    it('should return empty array for non-matching search', async () => {
      const posts = await listPosts({ q: 'nonexistent' });
      expect(posts).toHaveLength(0);
    });

    it('should sort posts by createdAt desc', async () => {
      const posts = await listPosts();
      if (posts.length > 1) {
        expect(posts[0].createdAt).toBeGreaterThanOrEqual(posts[1].createdAt);
      }
    });
  });

  describe('getPost', () => {
    it('should return post for existing id', async () => {
      const post = await getPost('c1');
      expect(post).toBeTruthy();
      expect(post?.id).toBe('c1');
      expect(post?.title).toBe('Welcome to the Community');
    });

    it('should return null for non-existent id', async () => {
      const post = await getPost('unknown');
      expect(post).toBeNull();
    });
  });

  describe('createPost', () => {
    it('should create post with valid data', async () => {
      const postData = {
        authorId: 'test-user',
        title: 'Test Post',
        body: 'This is a test post body.',
        tags: ['test']
      };

      const post = await createPost(postData);
      
      expect(post).toBeTruthy();
      expect(post.title).toBe('Test Post');
      expect(post.body).toBe('This is a test post body.');
      expect(post.tags).toEqual(['test']);
      expect(post.authorId).toBe('test-user');
      expect(post.id).toMatch(/^c-\d+$/);
    });

    it('should throw error for empty title', async () => {
      await expect(createPost({
        authorId: 'test-user',
        title: '   ',
        body: 'Valid body'
      })).rejects.toThrow('Title is required');
    });

    it('should throw error for empty body', async () => {
      await expect(createPost({
        authorId: 'test-user',
        title: 'Valid title',
        body: '   '
      })).rejects.toThrow('Body is required');
    });
  });

  describe('listComments', () => {
    it('should return empty array for post with no comments', async () => {
      const comments = await listComments('c1');
      expect(Array.isArray(comments)).toBe(true);
    });

    it('should sort comments by createdAt asc', async () => {
      // Add two comments
      await addComment({ postId: 'c1', authorId: 'user1', text: 'First comment' });
      await addComment({ postId: 'c1', authorId: 'user2', text: 'Second comment' });
      
      const comments = await listComments('c1');
      if (comments.length > 1) {
        expect(comments[0].createdAt).toBeLessThanOrEqual(comments[1].createdAt);
      }
    });
  });

  describe('addComment', () => {
    it('should create comment for existing post', async () => {
      const comment = await addComment({
        postId: 'c1',
        authorId: 'test-user',
        text: 'This is a test comment'
      });
      
      expect(comment).toBeTruthy();
      expect(comment.postId).toBe('c1');
      expect(comment.authorId).toBe('test-user');
      expect(comment.text).toBe('This is a test comment');
      expect(comment.createdAt).toBeGreaterThan(0);
      expect(comment.id).toMatch(/^cm-\d+$/);
    });

    it('should throw error for non-existent post', async () => {
      await expect(addComment({
        postId: 'unknown',
        authorId: 'test-user',
        text: 'Comment text'
      })).rejects.toThrow('Post not found');
    });

    it('should throw error for empty text', async () => {
      await expect(addComment({
        postId: 'c1',
        authorId: 'test-user',
        text: '   '
      })).rejects.toThrow('Comment text cannot be empty');
    });

    it('should trim whitespace from text', async () => {
      const comment = await addComment({
        postId: 'c1',
        authorId: 'test-user',
        text: '  Comment with spaces  '
      });
      
      expect(comment.text).toBe('Comment with spaces');
    });
  });
});