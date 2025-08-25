import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CREDENTIALS_PATH = resolve(__dirname, '../../../../data/seeds/credentials/credentials.json');
const RESUME_PATH = resolve(__dirname, '../../../../data/seeds/credentials/resume.json');
const CARDS_PATH = resolve(__dirname, '../../../../data/seeds/credentials/cards.json');

export interface Credential {
  id: string;
  userId: string;
  name: string;
  issuer?: string;
  licenseNo?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  status?: 'active' | 'expiringSoon' | 'expired';
}

export interface Resume {
  userId: string;
  url?: string;
  text?: string;
  updatedAt: number;
}

export interface BusinessCard {
  userId: string;
  name?: string;
  title?: string;
  org?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  updatedAt: number;
}

let credentialsCache: Credential[] | null = null;
let resumeCache: Resume | null = null;
let cardsCache: BusinessCard | null = null;

async function loadCredentials(): Promise<Credential[]> {
  if (credentialsCache) return credentialsCache;
  
  if (!existsSync(CREDENTIALS_PATH)) {
    credentialsCache = [];
    return credentialsCache;
  }
  
  const raw = await readFile(CREDENTIALS_PATH, 'utf-8');
  credentialsCache = JSON.parse(raw);
  return credentialsCache!;
}

async function saveCredentials(credentials: Credential[]): Promise<void> {
  credentialsCache = credentials;
  await writeFile(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), 'utf-8');
}

async function loadResume(userId: string): Promise<Resume> {
  if (resumeCache && resumeCache.userId === userId) return resumeCache;
  
  if (!existsSync(RESUME_PATH)) {
    resumeCache = { userId, url: '', text: '', updatedAt: 0 };
    return resumeCache;
  }
  
  const raw = await readFile(RESUME_PATH, 'utf-8');
  const data = JSON.parse(raw);
  
  // Handle both single user and multi-user formats
  if (Array.isArray(data)) {
    resumeCache = data.find(r => r.userId === userId) || { userId, url: '', text: '', updatedAt: 0 };
  } else {
    resumeCache = data.userId === userId ? data : { userId, url: '', text: '', updatedAt: 0 };
  }
  
  return resumeCache;
}

async function saveResume(resume: Resume): Promise<void> {
  resumeCache = resume;
  await writeFile(RESUME_PATH, JSON.stringify(resume, null, 2), 'utf-8');
}

async function loadCard(userId: string): Promise<BusinessCard> {
  if (cardsCache && cardsCache.userId === userId) return cardsCache;
  
  if (!existsSync(CARDS_PATH)) {
    cardsCache = { userId, name: '', title: '', org: '', email: '', phone: '', website: '', location: '', updatedAt: 0 };
    return cardsCache;
  }
  
  const raw = await readFile(CARDS_PATH, 'utf-8');
  const data = JSON.parse(raw);
  
  // Handle both single user and multi-user formats
  if (Array.isArray(data)) {
    cardsCache = data.find(c => c.userId === userId) || { userId, name: '', title: '', org: '', email: '', phone: '', website: '', location: '', updatedAt: 0 };
  } else {
    cardsCache = data.userId === userId ? data : { userId, name: '', title: '', org: '', email: '', phone: '', website: '', location: '', updatedAt: 0 };
  }
  
  return cardsCache;
}

async function saveCard(card: BusinessCard): Promise<void> {
  cardsCache = card;
  await writeFile(CARDS_PATH, JSON.stringify(card, null, 2), 'utf-8');
}

function computeStatus(expiresAt?: string): 'active' | 'expiringSoon' | 'expired' {
  if (!expiresAt) return 'active';
  
  const today = new Date();
  const expiry = new Date(expiresAt);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiringSoon';
  return 'active';
}

export async function listCredentials(userId: string): Promise<Credential[]> {
  const credentials = await loadCredentials();
  const userCredentials = credentials.filter(c => c.userId === userId);
  
  // Add computed status and sort by expiresAt asc
  const withStatus = userCredentials.map(credential => ({
    ...credential,
    status: computeStatus(credential.expiresAt)
  }));
  
  // Sort by expiresAt ascending (soonest expiry first), then by name
  withStatus.sort((a, b) => {
    if (!a.expiresAt && !b.expiresAt) return a.name.localeCompare(b.name);
    if (!a.expiresAt) return 1;
    if (!b.expiresAt) return -1;
    
    const dateCompare = a.expiresAt.localeCompare(b.expiresAt);
    return dateCompare !== 0 ? dateCompare : a.name.localeCompare(b.name);
  });
  
  return withStatus;
}

export async function addCredential(userId: string, data: Omit<Credential, 'id' | 'userId' | 'status'>): Promise<Credential> {
  // Validate required fields
  if (!data.name?.trim()) {
    throw new Error('Name is required');
  }

  const credentials = await loadCredentials();
  
  const credential: Credential = {
    id: `c-${Date.now()}`,
    userId,
    name: data.name.trim(),
    issuer: data.issuer?.trim() || '',
    licenseNo: data.licenseNo?.trim() || '',
    issuedAt: data.issuedAt || '',
    expiresAt: data.expiresAt || '',
    notes: data.notes?.trim() || '',
    status: computeStatus(data.expiresAt)
  };

  credentials.push(credential);
  await saveCredentials(credentials);
  
  return credential;
}

export async function updateCredential(userId: string, id: string, patch: Partial<Credential>): Promise<Credential | null> {
  const credentials = await loadCredentials();
  const index = credentials.findIndex(c => c.id === id && c.userId === userId);
  
  if (index === -1) return null;

  // Validate allowed fields and filter out system fields
  const allowedFields = ['name', 'issuer', 'licenseNo', 'issuedAt', 'expiresAt', 'notes'];
  const filteredPatch: Partial<Credential> = {};
  
  for (const [key, value] of Object.entries(patch)) {
    if (allowedFields.includes(key)) {
      (filteredPatch as any)[key] = typeof value === 'string' ? value.trim() : value;
    }
  }

  // Update the credential
  credentials[index] = { 
    ...credentials[index], 
    ...filteredPatch,
    status: computeStatus(filteredPatch.expiresAt || credentials[index].expiresAt)
  };
  
  await saveCredentials(credentials);
  return credentials[index];
}

export async function deleteCredential(userId: string, id: string): Promise<boolean> {
  const credentials = await loadCredentials();
  const index = credentials.findIndex(c => c.id === id && c.userId === userId);
  
  if (index === -1) return false;

  credentials.splice(index, 1);
  await saveCredentials(credentials);
  
  return true;
}

export async function getResume(userId: string): Promise<Resume> {
  return loadResume(userId);
}

export async function setResume(userId: string, data: { url?: string; text?: string }): Promise<Resume> {
  const resume = await loadResume(userId);
  
  const updatedResume: Resume = {
    ...resume,
    url: data.url?.trim() || resume.url || '',
    text: data.text?.trim() || resume.text || '',
    updatedAt: Date.now()
  };
  
  await saveResume(updatedResume);
  return updatedResume;
}

export async function getCard(userId: string): Promise<BusinessCard> {
  return loadCard(userId);
}

export async function setCard(userId: string, patch: Partial<BusinessCard>): Promise<BusinessCard> {
  const card = await loadCard(userId);
  
  // Filter allowed fields and trim strings
  const allowedFields = ['name', 'title', 'org', 'email', 'phone', 'website', 'location'];
  const filteredPatch: Partial<BusinessCard> = {};
  
  for (const [key, value] of Object.entries(patch)) {
    if (allowedFields.includes(key)) {
      (filteredPatch as any)[key] = typeof value === 'string' ? value.trim() : value;
    }
  }
  
  const updatedCard: BusinessCard = {
    ...card,
    ...filteredPatch,
    updatedAt: Date.now()
  };
  
  await saveCard(updatedCard);
  return updatedCard;
}