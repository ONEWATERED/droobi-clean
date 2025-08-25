import { readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEBINARS_PATH = resolve(__dirname, '../../../../data/seeds/webinars/webinars.json');
const REGISTRATIONS_PATH = resolve(__dirname, '../../../../data/seeds/webinars/registrations.json');
const LOGS_DIR = resolve(__dirname, '../../../../data/logs');

export interface Webinar {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  host: string;
  platform: string;
  description: string;
}

export interface Registration {
  id: string;
  webinarId: string;
  name: string;
  email: string;
  registeredAt: string;
}

let webinarsCache: Webinar[] | null = null;
let registrationsCache: Registration[] | null = null;

async function loadWebinars(): Promise<Webinar[]> {
  if (webinarsCache) return webinarsCache;
  const raw = await readFile(WEBINARS_PATH, 'utf-8');
  webinarsCache = JSON.parse(raw);
  return webinarsCache!;
}

async function loadRegistrations(): Promise<Registration[]> {
  if (registrationsCache) return registrationsCache;
  
  if (!existsSync(REGISTRATIONS_PATH)) {
    registrationsCache = [];
    return registrationsCache;
  }
  
  const raw = await readFile(REGISTRATIONS_PATH, 'utf-8');
  registrationsCache = JSON.parse(raw);
  return registrationsCache!;
}

async function saveRegistrations(registrations: Registration[]): Promise<void> {
  registrationsCache = registrations;
  await writeFile(REGISTRATIONS_PATH, JSON.stringify(registrations, null, 2), 'utf-8');
}

export async function listWebinars(filters?: {
  q?: string;
  from?: string;
  to?: string;
}) {
  const webinars = await loadWebinars();
  let filtered = webinars;

  // Filter by date range (upcoming by default)
  const now = new Date().toISOString();
  const fromDate = filters?.from || now;
  const toDate = filters?.to;

  filtered = filtered.filter(webinar => {
    const startsAt = webinar.startsAt;
    if (startsAt < fromDate) return false;
    if (toDate && startsAt > toDate) return false;
    return true;
  });

  // Filter by search query
  if (filters?.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(webinar =>
      webinar.title.toLowerCase().includes(searchTerm) ||
      webinar.description.toLowerCase().includes(searchTerm) ||
      webinar.host.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by start date
  filtered.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return filtered;
}

export async function getWebinar(id: string): Promise<Webinar | null> {
  const webinars = await loadWebinars();
  return webinars.find(w => w.id === id) || null;
}

export async function registerForWebinar(
  id: string,
  data: { name: string; email: string }
): Promise<Registration | null> {
  // Check if webinar exists
  const webinar = await getWebinar(id);
  if (!webinar) return null;

  const registrations = await loadRegistrations();
  
  // Check if already registered
  const existingRegistration = registrations.find(
    r => r.webinarId === id && r.email === data.email
  );
  
  if (existingRegistration) {
    return existingRegistration;
  }

  // Create new registration
  const registration: Registration = {
    id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    webinarId: id,
    name: data.name,
    email: data.email,
    registeredAt: new Date().toISOString()
  };

  registrations.push(registration);
  await saveRegistrations(registrations);

  return registration;
}

export async function logWebhookPayload(
  platform: string,
  payload: any
): Promise<void> {
  try {
    // Ensure logs directory exists
    if (!existsSync(LOGS_DIR)) {
      await mkdir(LOGS_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${platform}-webhook-${timestamp}.json`;
    const filepath = resolve(LOGS_DIR, filename);

    const logEntry = {
      timestamp: new Date().toISOString(),
      platform,
      payload
    };

    await writeFile(filepath, JSON.stringify(logEntry, null, 2), 'utf-8');
    console.log(`Webhook payload logged to: ${filepath}`);
  } catch (error) {
    console.error('Failed to log webhook payload:', error);
  }
}