import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FLAGS_PATH = resolve(__dirname, '../../../../data/seeds/admin/feature-flags.json');
const USERS_PATH = resolve(__dirname, '../../../../data/seeds/settings/users.json');

export interface FeatureFlags {
  lexicon: boolean;
  directory: boolean;
  microsites: boolean;
  profiles: boolean;
  webinars: boolean;
  tv: boolean;
  trainings: boolean;
  projects: boolean;
  lounge: boolean;
  community: boolean;
  inbox: boolean;
  gamification: boolean;
  quiz: boolean;
  waterMinute: boolean;
  credentials: boolean;
}

export interface UserSettings {
  userId: string;
  timezone: string;
  emailAlerts: boolean;
}

let flagsCache: FeatureFlags | null = null;
let usersCache: UserSettings[] | null = null;

async function loadFlags(): Promise<FeatureFlags> {
  if (flagsCache) return flagsCache;
  
  if (!existsSync(FLAGS_PATH)) {
    // Return default flags if file doesn't exist
    flagsCache = {
      lexicon: true,
      directory: true,
      microsites: true,
      profiles: true,
      webinars: false,
      tv: false,
      trainings: false,
      projects: false,
      lounge: false,
      community: false,
      inbox: false,
      gamification: false,
      quiz: false,
      waterMinute: false,
      credentials: false
    };
    return flagsCache;
  }
  
  const raw = await readFile(FLAGS_PATH, 'utf-8');
  flagsCache = JSON.parse(raw);
  return flagsCache!;
}

async function saveFlags(flags: FeatureFlags): Promise<void> {
  flagsCache = flags;
  await writeFile(FLAGS_PATH, JSON.stringify(flags, null, 2), 'utf-8');
}

async function loadUsers(): Promise<UserSettings[]> {
  if (usersCache) return usersCache;
  
  if (!existsSync(USERS_PATH)) {
    usersCache = [];
    return usersCache;
  }
  
  const raw = await readFile(USERS_PATH, 'utf-8');
  usersCache = JSON.parse(raw);
  return usersCache!;
}

async function saveUsers(users: UserSettings[]): Promise<void> {
  usersCache = users;
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

export async function getFlags(): Promise<FeatureFlags> {
  return loadFlags();
}

export async function setFlags(patch: Partial<FeatureFlags>): Promise<FeatureFlags> {
  const currentFlags = await loadFlags();
  
  // Merge patch with current flags
  const updatedFlags: FeatureFlags = {
    ...currentFlags,
    ...patch
  };
  
  await saveFlags(updatedFlags);
  return updatedFlags;
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const users = await loadUsers();
  const userSettings = users.find(u => u.userId === userId);
  
  // Return default settings if user not found
  if (!userSettings) {
    return {
      userId,
      timezone: 'America/New_York',
      emailAlerts: true
    };
  }
  
  return userSettings;
}

export async function setUserSettings(userId: string, patch: Partial<UserSettings>): Promise<UserSettings> {
  const users = await loadUsers();
  const userIndex = users.findIndex(u => u.userId === userId);
  
  let userSettings: UserSettings;
  
  if (userIndex >= 0) {
    // Update existing user
    userSettings = {
      ...users[userIndex],
      ...patch,
      userId // Ensure userId is preserved
    };
    users[userIndex] = userSettings;
  } else {
    // Create new user settings
    userSettings = {
      userId,
      timezone: 'America/New_York',
      emailAlerts: true,
      ...patch
    };
    users.push(userSettings);
  }
  
  await saveUsers(users);
  return userSettings;
}