import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROFILES_PATH = resolve(__dirname, '../../../../data/seeds/profiles/profiles.json');

export interface Profile {
  id: string;
  orgId: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
  socials: {
    linkedin?: string;
    x?: string;
  };
}

let cache: Profile[] | null = null;

async function load(): Promise<Profile[]> {
  if (cache) return cache;
  const raw = await readFile(PROFILES_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

async function save(profiles: Profile[]): Promise<void> {
  cache = profiles;
  await writeFile(PROFILES_PATH, JSON.stringify(profiles, null, 2), 'utf-8');
}

export async function getProfile(id: string): Promise<Profile | null> {
  const profiles = await load();
  return profiles.find(p => p.id === id) || null;
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<Profile | null> {
  const profiles = await load();
  const index = profiles.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }

  // Validate allowed fields
  const allowedFields = ['name', 'title', 'bio', 'skills', 'avatarUrl', 'socials'];
  const filteredPatch: Partial<Profile> = {};
  
  for (const [key, value] of Object.entries(patch)) {
    if (allowedFields.includes(key)) {
      (filteredPatch as any)[key] = value;
    }
  }

  // Update the profile
  profiles[index] = { ...profiles[index], ...filteredPatch };
  
  await save(profiles);
  return profiles[index];
}