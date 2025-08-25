import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BADGES_PATH = resolve(__dirname, '../../../../data/seeds/gamification/badges.json');
const POINTS_PATH = resolve(__dirname, '../../../../data/seeds/gamification/points.json');
const EVENTS_PATH = resolve(__dirname, '../../../../data/seeds/gamification/events.json');

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: {
    type: string;
    threshold: number;
  };
}

export interface UserPoints {
  userId: string;
  points: number;
}

export interface GameEvent {
  id: string;
  userId: string;
  type: string;
  refId?: string;
  at: number;
}

let badgesCache: Badge[] | null = null;
let pointsCache: UserPoints[] | null = null;
let eventsCache: GameEvent[] | null = null;

async function loadBadges(): Promise<Badge[]> {
  if (badgesCache) return badgesCache;
  const raw = await readFile(BADGES_PATH, 'utf-8');
  badgesCache = JSON.parse(raw);
  return badgesCache!;
}

async function loadPoints(): Promise<UserPoints[]> {
  if (pointsCache) return pointsCache;
  
  if (!existsSync(POINTS_PATH)) {
    pointsCache = [];
    return pointsCache;
  }
  
  const raw = await readFile(POINTS_PATH, 'utf-8');
  pointsCache = JSON.parse(raw);
  return pointsCache!;
}

async function savePoints(points: UserPoints[]): Promise<void> {
  pointsCache = points;
  await writeFile(POINTS_PATH, JSON.stringify(points, null, 2), 'utf-8');
}

async function loadEvents(): Promise<GameEvent[]> {
  if (eventsCache) return eventsCache;
  
  if (!existsSync(EVENTS_PATH)) {
    eventsCache = [];
    return eventsCache;
  }
  
  const raw = await readFile(EVENTS_PATH, 'utf-8');
  eventsCache = JSON.parse(raw);
  return eventsCache!;
}

async function saveEvents(events: GameEvent[]): Promise<void> {
  eventsCache = events;
  await writeFile(EVENTS_PATH, JSON.stringify(events, null, 2), 'utf-8');
}

export async function getPoints(userId: string): Promise<number> {
  const points = await loadPoints();
  const userPoints = points.find(p => p.userId === userId);
  return userPoints?.points || 0;
}

export async function addPoints(userId: string, delta: number, meta?: any): Promise<number> {
  const points = await loadPoints();
  const events = await loadEvents();
  
  // Update or create user points
  const userIndex = points.findIndex(p => p.userId === userId);
  if (userIndex >= 0) {
    points[userIndex].points += delta;
  } else {
    points.push({ userId, points: delta });
  }
  
  // Log points awarded event
  const event: GameEvent = {
    id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'points.awarded',
    refId: meta?.reason || undefined,
    at: Date.now()
  };
  
  events.push(event);
  
  await savePoints(points);
  await saveEvents(events);
  
  return points.find(p => p.userId === userId)?.points || 0;
}

export async function listLeaderboard(limit: number = 10): Promise<UserPoints[]> {
  const points = await loadPoints();
  
  // Sort by points desc, then by userId for ties
  return points
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.userId.localeCompare(b.userId);
    })
    .slice(0, limit);
}

export async function listBadges(): Promise<Badge[]> {
  return loadBadges();
}

export async function listMyBadges(userId: string): Promise<Badge[]> {
  const badges = await loadBadges();
  const events = await loadEvents();
  
  // Filter events for this user
  const userEvents = events.filter(e => e.userId === userId);
  
  // Check each badge criteria
  const earnedBadges: Badge[] = [];
  
  for (const badge of badges) {
    let earned = false;
    
    switch (badge.criteria.type) {
      case 'events':
        // Count total events (excluding points.awarded)
        const eventCount = userEvents.filter(e => e.type !== 'points.awarded').length;
        earned = eventCount >= badge.criteria.threshold;
        break;
        
      case 'comments':
        // Count comment.posted events
        const commentCount = userEvents.filter(e => e.type === 'comment.posted').length;
        earned = commentCount >= badge.criteria.threshold;
        break;
        
      case 'modulesVisited':
        // Count unique module.visited events by refId
        const moduleVisits = new Set(
          userEvents
            .filter(e => e.type === 'module.visited')
            .map(e => e.refId)
            .filter(Boolean)
        );
        earned = moduleVisits.size >= badge.criteria.threshold;
        break;
    }
    
    if (earned) {
      earnedBadges.push(badge);
    }
  }
  
  return earnedBadges;
}

export async function logEvent(userId: string, type: string, refId?: string): Promise<GameEvent> {
  const events = await loadEvents();
  
  // Create event
  const event: GameEvent = {
    id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    refId,
    at: Date.now()
  };
  
  events.push(event);
  await saveEvents(events);
  
  // Apply automatic point rules
  let pointsAwarded = 0;
  switch (type) {
    case 'webinar.registered':
      pointsAwarded = 10;
      break;
    case 'projects.saved':
      pointsAwarded = 5;
      break;
    case 'community.posted':
      pointsAwarded = 8;
      break;
    case 'comment.posted':
      pointsAwarded = 3;
      break;
  }
  
  if (pointsAwarded > 0) {
    await addPoints(userId, pointsAwarded, { reason: type });
  }
  
  return event;
}