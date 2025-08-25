import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_PATH = resolve(__dirname, '../../../../data/seeds/community/posts.json');
const COMMENTS_PATH = resolve(__dirname, '../../../../data/seeds/community/comments.json');

export interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
}

let postsCache: Post[] | null = null;
let commentsCache: Comment[] | null = null;

async function loadPosts(): Promise<Post[]> {
  if (postsCache) return postsCache;
  const raw = await readFile(POSTS_PATH, 'utf-8');
  postsCache = JSON.parse(raw);
  return postsCache!;
}

async function savePosts(posts: Post[]): Promise<void> {
  postsCache = posts;
  await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

async function loadComments(): Promise<Comment[]> {
  if (commentsCache) return commentsCache;
  
  if (!existsSync(COMMENTS_PATH)) {
    commentsCache = [];
    return commentsCache;
  }
  
  const raw = await readFile(COMMENTS_PATH, 'utf-8');
  commentsCache = JSON.parse(raw);
  return commentsCache!;
}

async function saveComments(comments: Comment[]): Promise<void> {
  commentsCache = comments;
  await writeFile(COMMENTS_PATH, JSON.stringify(comments, null, 2), 'utf-8');
}

export async function listPosts(filters?: {
  q?: string;
  tag?: string;
}) {
  const posts = await loadPosts();
  let filtered = posts;

  // Filter by search query
  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.body.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by tag
  if (filters?.tag) {
    filtered = filtered.filter(post =>
      post.tags.includes(filters.tag!)
    );
  }

  // Sort by createdAt desc (newest first)
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  return filtered;
}

export async function getPost(id: string): Promise<Post | null> {
  const posts = await loadPosts();
  return posts.find(p => p.id === id) || null;
}

export async function createPost(data: {
  authorId: string;
  title: string;
  body: string;
  tags?: string[];
}): Promise<Post> {
  // Validate required fields
  if (!data.title.trim()) {
    throw new Error('Title is required');
  }
  
  if (!data.body.trim()) {
    throw new Error('Body is required');
  }

  const posts = await loadPosts();
  
  const post: Post = {
    id: `c-${Date.now()}`,
    authorId: data.authorId,
    title: data.title.trim(),
    body: data.body.trim(),
    tags: data.tags || [],
    createdAt: Date.now()
  };

  posts.push(post);
  await savePosts(posts);
  
  return post;
}

export async function listComments(postId: string): Promise<Comment[]> {
  const comments = await loadComments();
  
  // Filter by postId and sort by createdAt asc (chronological)
  return comments
    .filter(c => c.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function addComment(data: {
  postId: string;
  authorId: string;
  text: string;
}): Promise<Comment> {
  // Validate text is non-empty after trimming
  const text = data.text.trim();
  if (!text) {
    throw new Error('Comment text cannot be empty');
  }

  // Check if post exists
  const post = await getPost(data.postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comments = await loadComments();
  
  const comment: Comment = {
    id: `cm-${Date.now()}`,
    postId: data.postId,
    authorId: data.authorId,
    text,
    createdAt: Date.now()
  };

  comments.push(comment);
  await saveComments(comments);
  
  return comment;
}