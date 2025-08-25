import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BID_ROOMS_PATH = resolve(__dirname, '../../../../data/seeds/projects/bid-rooms.json');
const BID_ARTIFACTS_PATH = resolve(__dirname, '../../../../data/seeds/projects/bid-artifacts.json');
const BID_TASKS_PATH = resolve(__dirname, '../../../../data/seeds/projects/bid-tasks.json');

export interface BidRoom {
  id: string;
  projectId: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface BidArtifact {
  id: string;
  roomId: string;
  name: string;
  url?: string;
  createdAt: string;
}

export interface BidTask {
  id: string;
  roomId: string;
  title: string;
  assignee?: string;
  dueAt?: string;
  status: 'pending' | 'complete';
  createdAt: string;
}

let bidRoomsCache: BidRoom[] | null = null;
let bidArtifactsCache: BidArtifact[] | null = null;
let bidTasksCache: BidTask[] | null = null;

async function loadBidRooms(): Promise<BidRoom[]> {
  if (bidRoomsCache) return bidRoomsCache;
  
  if (!existsSync(BID_ROOMS_PATH)) {
    bidRoomsCache = [];
    return bidRoomsCache;
  }
  
  const raw = await readFile(BID_ROOMS_PATH, 'utf-8');
  bidRoomsCache = JSON.parse(raw);
  return bidRoomsCache!;
}

async function saveBidRooms(bidRooms: BidRoom[]): Promise<void> {
  bidRoomsCache = bidRooms;
  await writeFile(BID_ROOMS_PATH, JSON.stringify(bidRooms, null, 2), 'utf-8');
}

async function loadBidArtifacts(): Promise<BidArtifact[]> {
  if (bidArtifactsCache) return bidArtifactsCache;
  
  if (!existsSync(BID_ARTIFACTS_PATH)) {
    bidArtifactsCache = [];
    return bidArtifactsCache;
  }
  
  const raw = await readFile(BID_ARTIFACTS_PATH, 'utf-8');
  bidArtifactsCache = JSON.parse(raw);
  return bidArtifactsCache!;
}

async function saveBidArtifacts(artifacts: BidArtifact[]): Promise<void> {
  bidArtifactsCache = artifacts;
  await writeFile(BID_ARTIFACTS_PATH, JSON.stringify(artifacts, null, 2), 'utf-8');
}

async function loadBidTasks(): Promise<BidTask[]> {
  if (bidTasksCache) return bidTasksCache;
  
  if (!existsSync(BID_TASKS_PATH)) {
    bidTasksCache = [];
    return bidTasksCache;
  }
  
  const raw = await readFile(BID_TASKS_PATH, 'utf-8');
  bidTasksCache = JSON.parse(raw);
  return bidTasksCache!;
}

async function saveBidTasks(tasks: BidTask[]): Promise<void> {
  bidTasksCache = tasks;
  await writeFile(BID_TASKS_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
}

export async function createBidRoom(data: {
  projectId: string;
  name: string;
  ownerId: string;
}): Promise<BidRoom> {
  const bidRooms = await loadBidRooms();
  
  const bidRoom: BidRoom = {
    id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId: data.projectId,
    name: data.name,
    ownerId: data.ownerId,
    members: [data.ownerId],
    createdAt: new Date().toISOString()
  };

  bidRooms.push(bidRoom);
  await saveBidRooms(bidRooms);

  return bidRoom;
}

export async function getBidRoom(id: string): Promise<BidRoom | null> {
  const bidRooms = await loadBidRooms();
  return bidRooms.find(r => r.id === id) || null;
}

export async function listBidRooms(userId: string): Promise<BidRoom[]> {
  const bidRooms = await loadBidRooms();
  return bidRooms.filter(r => r.ownerId === userId || r.members.includes(userId));
}

export async function addArtifact(data: {
  roomId: string;
  name: string;
  url?: string;
}): Promise<BidArtifact> {
  const artifacts = await loadBidArtifacts();
  
  const artifact: BidArtifact = {
    id: `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId: data.roomId,
    name: data.name,
    url: data.url,
    createdAt: new Date().toISOString()
  };

  artifacts.push(artifact);
  await saveBidArtifacts(artifacts);

  return artifact;
}

export async function addTask(data: {
  roomId: string;
  title: string;
  assignee?: string;
  dueAt?: string;
}): Promise<BidTask> {
  const tasks = await loadBidTasks();
  
  const task: BidTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId: data.roomId,
    title: data.title,
    assignee: data.assignee,
    dueAt: data.dueAt,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  await saveBidTasks(tasks);

  return task;
}

export async function inviteMember(data: {
  roomId: string;
  userId?: string;
  email?: string;
}): Promise<BidRoom | null> {
  const bidRooms = await loadBidRooms();
  const roomIndex = bidRooms.findIndex(r => r.id === data.roomId);
  
  if (roomIndex === -1) return null;

  const room = bidRooms[roomIndex];
  
  // For now, we'll just add userId to members if provided
  // In a real app, you'd handle email invitations differently
  if (data.userId && !room.members.includes(data.userId)) {
    room.members.push(data.userId);
    bidRooms[roomIndex] = room;
    await saveBidRooms(bidRooms);
  }

  return room;
}

export async function getRoomArtifacts(roomId: string): Promise<BidArtifact[]> {
  const artifacts = await loadBidArtifacts();
  return artifacts.filter(a => a.roomId === roomId);
}

export async function getRoomTasks(roomId: string): Promise<BidTask[]> {
  const tasks = await loadBidTasks();
  return tasks.filter(t => t.roomId === roomId);
}