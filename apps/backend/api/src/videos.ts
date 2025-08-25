import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VIDEOS_PATH = resolve(__dirname, '../../../../data/seeds/videos/videos.json');

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  poster?: string;
  tags: string[];
  publishedAt: string;
  durationSec: number;
}

let cache: Video[] | null = null;

async function load(): Promise<Video[]> {
  if (cache) return cache;
  
  if (!existsSync(VIDEOS_PATH)) {
    cache = [];
    return cache;
  }
  
  const raw = await readFile(VIDEOS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

async function save(videos: Video[]): Promise<void> {
  cache = videos;
  await writeFile(VIDEOS_PATH, JSON.stringify(videos, null, 2), 'utf-8');
}

export async function listVideos(filters?: {
  q?: string;
  tag?: string;
}) {
  const videos = await load();
  let filtered = videos;

  // Filter by search query
  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(video =>
      video.title.toLowerCase().includes(searchTerm) ||
      video.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by tag
  if (filters?.tag) {
    filtered = filtered.filter(video =>
      video.tags.includes(filters.tag!)
    );
  }

  // Sort by publishedAt desc (newest first)
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return filtered;
}

export async function getVideo(id: string): Promise<Video | null> {
  const videos = await load();
  return videos.find(v => v.id === id) || null;
}

export async function createVideo(videoData: Omit<Video, 'id'> & { id?: string }): Promise<Video> {
  const videos = await load();
  
  // Generate ID if not provided
  const id = videoData.id || `v-${Date.now()}`;
  
  const video: Video = {
    id,
    title: videoData.title,
    description: videoData.description,
    url: videoData.url,
    poster: videoData.poster || '',
    tags: videoData.tags || [],
    publishedAt: videoData.publishedAt || new Date().toISOString(),
    durationSec: videoData.durationSec || 0
  };

  videos.push(video);
  await save(videos);
  
  return video;
}