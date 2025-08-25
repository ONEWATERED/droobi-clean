import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TERMS_PATH = resolve(__dirname, '../../../../data/seeds/lexicon/terms.json');

let cache: any[] | null = null;
async function load(): Promise<any[]> {
  if (cache) return cache;
  const raw = await readFile(TERMS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache!;
}

export async function listTerms(q?: string) {
  const terms = await load();
  if (!q) return terms;
  const s = q.toLowerCase();
  return terms.filter(t =>
    t.title.toLowerCase().includes(s) ||
    (t.aliases || []).some((a: string) => a.toLowerCase().includes(s)) ||
    (t.tags || []).some((tag: string) => tag.toLowerCase().includes(s))
  );
}

export async function getTerm(id: string) {
  const terms = await load();
  return terms.find(t => t.id === id) || null;
}
