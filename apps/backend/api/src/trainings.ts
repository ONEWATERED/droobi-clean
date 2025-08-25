import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TRAININGS_PATH = resolve(__dirname, '../../../../data/seeds/trainings/trainings.json');
const ENROLLMENTS_PATH = resolve(__dirname, '../../../../data/seeds/trainings/enrollments.json');
const PROGRESS_PATH = resolve(__dirname, '../../../../data/seeds/trainings/progress.json');

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
}

export interface Training {
  id: string;
  title: string;
  level: string;
  durationMin: number;
  tags: string[];
  publishedAt: string;
  description: string;
  lessons: Lesson[];
}

export interface Enrollment {
  id: string;
  userId: string;
  trainingId: string;
  name: string;
  email: string;
  enrolledAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  trainingId: string;
  lessonId: string;
  status: 'complete' | 'incomplete';
  updatedAt: string;
}

let trainingsCache: Training[] | null = null;
let enrollmentsCache: Enrollment[] | null = null;
let progressCache: Progress[] | null = null;

async function loadTrainings(): Promise<Training[]> {
  if (trainingsCache) return trainingsCache;
  const raw = await readFile(TRAININGS_PATH, 'utf-8');
  trainingsCache = JSON.parse(raw);
  return trainingsCache!;
}

async function loadEnrollments(): Promise<Enrollment[]> {
  if (enrollmentsCache) return enrollmentsCache;
  
  if (!existsSync(ENROLLMENTS_PATH)) {
    enrollmentsCache = [];
    return enrollmentsCache;
  }
  
  const raw = await readFile(ENROLLMENTS_PATH, 'utf-8');
  enrollmentsCache = JSON.parse(raw);
  return enrollmentsCache!;
}

async function saveEnrollments(enrollments: Enrollment[]): Promise<void> {
  enrollmentsCache = enrollments;
  await writeFile(ENROLLMENTS_PATH, JSON.stringify(enrollments, null, 2), 'utf-8');
}

async function loadProgress(): Promise<Progress[]> {
  if (progressCache) return progressCache;
  
  if (!existsSync(PROGRESS_PATH)) {
    progressCache = [];
    return progressCache;
  }
  
  const raw = await readFile(PROGRESS_PATH, 'utf-8');
  progressCache = JSON.parse(raw);
  return progressCache!;
}

async function saveProgress(progress: Progress[]): Promise<void> {
  progressCache = progress;
  await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

export async function listTrainings(filters?: {
  q?: string;
  level?: string;
  tag?: string;
}) {
  const trainings = await loadTrainings();
  let filtered = trainings;

  // Filter by search query
  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(training =>
      training.title.toLowerCase().includes(searchTerm) ||
      training.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by level
  if (filters?.level) {
    filtered = filtered.filter(training => training.level === filters.level);
  }

  // Filter by tag
  if (filters?.tag) {
    filtered = filtered.filter(training =>
      training.tags.includes(filters.tag!)
    );
  }

  // Sort by publishedAt desc (newest first)
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return filtered;
}

export async function getTraining(id: string): Promise<Training | null> {
  const trainings = await loadTrainings();
  return trainings.find(t => t.id === id) || null;
}

export async function enroll(data: {
  userId: string;
  trainingId: string;
  name: string;
  email: string;
}): Promise<Enrollment | null> {
  // Check if training exists
  const training = await getTraining(data.trainingId);
  if (!training) return null;

  const enrollments = await loadEnrollments();
  
  // Check if already enrolled
  const existingEnrollment = enrollments.find(
    e => e.userId === data.userId && e.trainingId === data.trainingId
  );
  
  if (existingEnrollment) {
    return existingEnrollment;
  }

  // Create new enrollment
  const enrollment: Enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    trainingId: data.trainingId,
    name: data.name,
    email: data.email,
    enrolledAt: new Date().toISOString()
  };

  enrollments.push(enrollment);
  await saveEnrollments(enrollments);

  return enrollment;
}

export async function setProgress(data: {
  userId: string;
  trainingId: string;
  lessonId: string;
  status: 'complete' | 'incomplete';
}): Promise<Progress> {
  const progress = await loadProgress();
  
  // Find existing progress entry
  const existingIndex = progress.findIndex(
    p => p.userId === data.userId && 
         p.trainingId === data.trainingId && 
         p.lessonId === data.lessonId
  );

  const progressEntry: Progress = {
    id: existingIndex >= 0 ? progress[existingIndex].id : `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    trainingId: data.trainingId,
    lessonId: data.lessonId,
    status: data.status,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing
    progress[existingIndex] = progressEntry;
  } else {
    // Add new
    progress.push(progressEntry);
  }

  await saveProgress(progress);
  return progressEntry;
}

export async function getProgress(data: {
  userId: string;
  trainingId: string;
}): Promise<Progress[]> {
  const progress = await loadProgress();
  
  return progress.filter(
    p => p.userId === data.userId && p.trainingId === data.trainingId
  );
}