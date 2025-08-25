import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MINUTES_PATH = resolve(__dirname, '../../../../data/seeds/water-minute/minutes.json');

export interface WaterMinute {
  id: string;
  date: string;
  title: string;
  summary: string;
  mediaType: 'video' | 'text' | 'link';
  url?: string;
  poster?: string;
  text?: string;
  tags: string[];
  publishedAt: string;
}

let cache: WaterMinute[] | null = null;

async function load(): Promise<WaterMinute[]> {
  if (cache) return cache;
  const raw = await readFile(MINUTES_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

export async function getToday(utcDate?: string): Promise<WaterMinute | null> {
  const minutes = await load();
  
  // Use provided date or current UTC date
  const targetDate = utcDate || new Date().toISOString().split('T')[0];
  
  // First try to find exact match for today
  let todayMinute = minutes.find(m => m.date === targetDate);
  
  // If no exact match, find the most recent past minute
  if (!todayMinute) {
    const pastMinutes = minutes
      .filter(m => m.date <= targetDate)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    todayMinute = pastMinutes[0] || null;
  }
  
  return todayMinute;
}

export async function getById(id: string): Promise<WaterMinute | null> {
  const minutes = await load();
  return minutes.find(m => m.id === id) || null;
}

export async function listHistory(limit: number = 14): Promise<Array<{
  id: string;
  date: string;
  title: string;
  tags: string[];
}>> {
  const minutes = await load();
  
  // Sort by date desc (newest first) and limit
  return minutes
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(m => ({
      id: m.id,
      date: m.date,
      title: m.title,
      tags: m.tags
    }));
}