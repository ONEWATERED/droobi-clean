import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NOTIFICATIONS_PATH = resolve(__dirname, '../../../../data/seeds/inbox/notifications.json');

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAt: number;
  readAt: number | null;
}

let cache: Notification[] | null = null;

async function load(): Promise<Notification[]> {
  if (cache) return cache;
  
  if (!existsSync(NOTIFICATIONS_PATH)) {
    cache = [];
    return cache;
  }
  
  const raw = await readFile(NOTIFICATIONS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

async function save(notifications: Notification[]): Promise<void> {
  cache = notifications;
  await writeFile(NOTIFICATIONS_PATH, JSON.stringify(notifications, null, 2), 'utf-8');
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const notifications = await load();
  
  // Filter by userId and sort by createdAt desc (newest first)
  return notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function markRead(userId: string, id: string): Promise<boolean> {
  const notifications = await load();
  const index = notifications.findIndex(n => n.id === id && n.userId === userId);
  
  if (index === -1) {
    return false;
  }

  // Mark as read with current timestamp
  notifications[index].readAt = Date.now();
  await save(notifications);
  
  return true;
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
}): Promise<Notification> {
  // Validate required fields
  if (!data.title.trim()) {
    throw new Error('Title is required');
  }
  
  if (!data.body.trim()) {
    throw new Error('Body is required');
  }

  const notifications = await load();
  
  const notification: Notification = {
    id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    type: data.type || 'general',
    title: data.title.trim(),
    body: data.body.trim(),
    createdAt: Date.now(),
    readAt: null
  };

  notifications.push(notification);
  await save(notifications);
  
  return notification;
}