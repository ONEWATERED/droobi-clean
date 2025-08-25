import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ORGS_PATH = resolve(__dirname, '../../../../data/seeds/directory/orgs.json');

let cache: any[] | null = null;
async function load(): Promise<any[]> {
  if (cache) return cache;
  const raw = await readFile(ORGS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

export async function listOrgs(filters?: {
  type?: string;
  category?: string;
  region?: string;
  q?: string;
}) {
  const orgs = await load();
  let filtered = orgs;

  if (filters?.type) {
    filtered = filtered.filter(org => org.type === filters.type);
  }

  if (filters?.category) {
    filtered = filtered.filter(org => org.category === filters.category);
  }

  if (filters?.region) {
    filtered = filtered.filter(org => org.region === filters.region);
  }

  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(org =>
      org.name.toLowerCase().includes(searchTerm) ||
      org.about.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

export async function getOrg(slug: string) {
  const orgs = await load();
  return orgs.find(org => org.slug === slug) || null;
}