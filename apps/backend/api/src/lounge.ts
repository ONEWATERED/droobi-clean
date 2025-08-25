import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOMS_PATH = resolve(__dirname, '../../../../data/seeds/lounge/rooms.json');
const MESSAGES_PATH = resolve(__dirname, '../../../../data/seeds/lounge/messages.json');

export interface Room {
  id: string;
  name: string;
  description: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: number;
}

let roomsCache: Room[] | null = null;
let messagesCache: Message[] | null = null;

async function loadRooms(): Promise<Room[]> {
  if (roomsCache) return roomsCache;
  const raw = await readFile(ROOMS_PATH, 'utf-8');
  roomsCache = JSON.parse(raw);
  return roomsCache!;
}

async function loadMessages(): Promise<Message[]> {
  if (messagesCache) return messagesCache;
  
  if (!existsSync(MESSAGES_PATH)) {
    messagesCache = [];
    return messagesCache;
  }
  
  const raw = await readFile(MESSAGES_PATH, 'utf-8');
  messagesCache = JSON.parse(raw);
  return messagesCache!;
}

async function saveMessages(messages: Message[]): Promise<void> {
  messagesCache = messages;
  await writeFile(MESSAGES_PATH, JSON.stringify(messages, null, 2), 'utf-8');
}

export async function listRooms(): Promise<Room[]> {
  return loadRooms();
}

export async function getRoom(id: string): Promise<Room | null> {
  const rooms = await loadRooms();
  return rooms.find(r => r.id === id) || null;
}

export async function listMessages(roomId: string, sinceEpochMs?: number): Promise<Message[]> {
  const messages = await loadMessages();
  let filtered = messages.filter(m => m.roomId === roomId);
  
  if (sinceEpochMs) {
    filtered = filtered.filter(m => m.createdAt > sinceEpochMs);
  }
  
  // Sort by createdAt ascending (chronological)
  filtered.sort((a, b) => a.createdAt - b.createdAt);
  
  return filtered;
}

export async function postMessage(roomId: string, data: { userId: string; text: string }): Promise<Message> {
  // Validate text is non-empty after trimming
  const text = data.text.trim();
  if (!text) {
    throw new Error('Message text cannot be empty');
  }

  // Check if room exists
  const room = await getRoom(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const messages = await loadMessages();
  
  const message: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    userId: data.userId,
    text,
    createdAt: Date.now()
  };

  messages.push(message);
  
  // Trim to last 5000 messages total
  if (messages.length > 5000) {
    messages.splice(0, messages.length - 5000);
  }
  
  await saveMessages(messages);
  return message;
}