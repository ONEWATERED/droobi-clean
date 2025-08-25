import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECTS_PATH = resolve(__dirname, '../../../../data/seeds/projects/projects.json');
const SAVED_PATH = resolve(__dirname, '../../../../data/seeds/projects/saved.json');

export interface Project {
  id: string;
  title: string;
  source: string;
  status: string;
  publishedAt: string;
  dueAt: string;
  buyer: string;
  category: string;
  region: string;
  summary: string;
  url: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

export interface SavedProject {
  id: string;
  userId: string;
  projectId: string;
  savedAt: string;
}

let projectsCache: Project[] | null = null;
let savedCache: SavedProject[] | null = null;

async function loadProjects(): Promise<Project[]> {
  if (projectsCache) return projectsCache;
  const raw = await readFile(PROJECTS_PATH, 'utf-8');
  projectsCache = JSON.parse(raw);
  return projectsCache!;
}

async function loadSaved(): Promise<SavedProject[]> {
  if (savedCache) return savedCache;
  
  if (!existsSync(SAVED_PATH)) {
    savedCache = [];
    return savedCache;
  }
  
  const raw = await readFile(SAVED_PATH, 'utf-8');
  savedCache = JSON.parse(raw);
  return savedCache!;
}

async function saveSaved(saved: SavedProject[]): Promise<void> {
  savedCache = saved;
  await writeFile(SAVED_PATH, JSON.stringify(saved, null, 2), 'utf-8');
}

export async function listProjects(filters?: {
  q?: string;
  source?: string;
  status?: string;
  category?: string;
  region?: string;
  dueBefore?: string;
}) {
  const projects = await loadProjects();
  let filtered = projects;

  // Filter by search query
  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(searchTerm) ||
      project.summary.toLowerCase().includes(searchTerm) ||
      project.buyer.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by source
  if (filters?.source) {
    filtered = filtered.filter(project => project.source === filters.source);
  }

  // Filter by status
  if (filters?.status) {
    filtered = filtered.filter(project => project.status === filters.status);
  }

  // Filter by category
  if (filters?.category) {
    filtered = filtered.filter(project => project.category === filters.category);
  }

  // Filter by region
  if (filters?.region) {
    filtered = filtered.filter(project => project.region === filters.region);
  }

  // Filter by due date
  if (filters?.dueBefore) {
    filtered = filtered.filter(project => {
      if (!project.dueAt) return false;
      return project.dueAt < filters.dueBefore!;
    });
  }

  // Sort by publishedAt desc (newest first)
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return filtered;
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await loadProjects();
  return projects.find(p => p.id === id) || null;
}

export async function saveProject(data: {
  userId: string;
  projectId: string;
}): Promise<{ isNew: boolean; saved: SavedProject }> {
  const saved = await loadSaved();
  
  // Check if already saved
  const existing = saved.find(
    s => s.userId === data.userId && s.projectId === data.projectId
  );
  
  if (existing) {
    return { isNew: false, saved: existing };
  }

  // Create new saved project
  const savedProject: SavedProject = {
    id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    projectId: data.projectId,
    savedAt: new Date().toISOString()
  };

  saved.push(savedProject);
  await saveSaved(saved);

  return { isNew: true, saved: savedProject };
}

export async function listSaved(userId: string): Promise<SavedProject[]> {
  const saved = await loadSaved();
  return saved.filter(s => s.userId === userId);
}