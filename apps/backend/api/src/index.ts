import Fastify from 'fastify';
import cors from '@fastify/cors';
import { listTerms, getTerm } from './lexicon';
import { listOrgs, getOrg } from './directory';
import { getProfile, updateProfile } from './profiles';
import { listWebinars, getWebinar, registerForWebinar, logWebhookPayload } from './webinars';
import { listVideos, getVideo, createVideo } from './videos';
import { listTrainings, getTraining, enroll, setProgress, getProgress } from './trainings';
import { listProjects, getProject, saveProject, listSaved } from './projects';
import { createBidRoom, getBidRoom, listBidRooms, addArtifact, addTask, inviteMember, getRoomArtifacts, getRoomTasks } from './bidrooms';
import { listRooms, getRoom, listMessages, postMessage } from './lounge';
import { listPosts, getPost, createPost, listComments, addComment } from './community';
import { listNotifications, markRead, createNotification } from './inbox';
import { getPoints, addPoints, listLeaderboard, listBadges, listMyBadges, logEvent } from './gamification';
import { getTodayQuiz, getQuizById, submitResponse, getMyResponse, getStats, getHistory } from './quiz';
import { getToday as getTodayWaterMinute, getById as getWaterMinuteById, listHistory as getWaterMinuteHistory } from './waterMinute';
import { listCredentials, addCredential, updateCredential, deleteCredential, getResume, setResume, getCard, setCard } from './credentials';
import { getFlags, setFlags, getUserSettings, setUserSettings } from './admin';
import { getAppSettings, setAppSettings, getPublicAppSettings } from './appSettings';

const app = Fastify();
await app.register(cors, { origin: true });

app.get('/health', async () => ({ status: 'ok' }));

app.get('/lexicon/terms', async (req) => {
  const q = (req.query as any)?.search as string | undefined;
  return listTerms(q);
});

app.get('/lexicon/terms/:id', async (req, reply) => {
  const { id } = req.params as any;
  const term = await getTerm(id);
  if (!term) return reply.code(404).send({ error: 'not_found' });
  return term;
});

app.get('/directory', async (req) => {
  const filters = req.query as any;
  return listOrgs(filters);
});

app.get('/org/:slug', async (req, reply) => {
  const { slug } = req.params as any;
  const org = await getOrg(slug);
  if (!org) return reply.code(404).send({ error: 'not_found' });
  return org;
});

// Profiles routes
app.get('/profiles/:id', async (req, reply) => {
  const { id } = req.params as any;
  const profile = await getProfile(id);
  if (!profile) return reply.code(404).send({ error: 'not_found' });
  return profile;
});

app.get('/profiles/me', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const profile = await getProfile(userId);
  if (!profile) return reply.code(404).send({ error: 'not_found' });
  return profile;
});

app.patch('/profiles/me', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const patch = req.body as any;
  
  const updatedProfile = await updateProfile(userId, patch);
  if (!updatedProfile) return reply.code(404).send({ error: 'not_found' });
  
  return updatedProfile;
});

// Webinars routes
app.get('/webinars', async (req) => {
  const filters = req.query as any;
  return listWebinars(filters);
});

app.get('/webinars/:id', async (req, reply) => {
  const { id } = req.params as any;
  const webinar = await getWebinar(id);
  if (!webinar) return reply.code(404).send({ error: 'not_found' });
  return webinar;
});

app.post('/webinars/:id/register', async (req, reply) => {
  const { id } = req.params as any;
  const { name, email } = req.body as any;
  
  if (!name || !email) {
    return reply.code(400).send({ error: 'name and email are required' });
  }
  
  const registration = await registerForWebinar(id, { name, email });
  if (!registration) return reply.code(404).send({ error: 'webinar_not_found' });
  
  return registration;
});

// Webhook routes
app.post('/webhooks/zoom', async (req, reply) => {
  await logWebhookPayload('zoom', req.body);
  return { status: 'received' };
});

app.post('/webhooks/meet', async (req, reply) => {
  await logWebhookPayload('meet', req.body);
  return { status: 'received' };
});

// Community routes
app.get('/community/posts', async (req) => {
  const filters = req.query as any;
  return listPosts(filters);
});

app.get('/community/posts/:id', async (req, reply) => {
  const { id } = req.params as any;
  const post = await getPost(id);
  if (!post) return reply.code(404).send({ error: 'post_not_found' });
  return post;
});

app.post('/community/posts', async (req, reply) => {
  const { title, body, tags } = req.body as any;
  const authorId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!title || !body) {
    return reply.code(400).send({ error: 'title and body are required' });
  }
  
  try {
    const post = await createPost({ authorId, title, body, tags });
    return reply.code(201).send(post);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Title is required' || error.message === 'Body is required')) {
      return reply.code(400).send({ error: error.message });
    }
    throw error;
  }
});

app.get('/community/posts/:id/comments', async (req, reply) => {
  const { id } = req.params as any;
  
  // Check if post exists
  const post = await getPost(id);
  if (!post) return reply.code(404).send({ error: 'post_not_found' });
  
  const comments = await listComments(id);
  return comments;
});

app.post('/community/posts/:id/comments', async (req, reply) => {
  const { id } = req.params as any;
  const { text } = req.body as any;
  const authorId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!text || typeof text !== 'string') {
    return reply.code(400).send({ error: 'text is required' });
  }
  
  try {
    const comment = await addComment({ postId: id, authorId, text });
    return reply.code(201).send(comment);
  } catch (error) {
    if (error instanceof Error && error.message === 'Post not found') {
      return reply.code(404).send({ error: 'post_not_found' });
    }
    if (error instanceof Error && error.message === 'Comment text cannot be empty') {
      return reply.code(400).send({ error: 'text_cannot_be_empty' });
    }
    throw error;
  }
});

// Videos routes
app.get('/videos', async (req) => {
  const filters = req.query as any;
  return listVideos(filters);
});

app.get('/videos/:id', async (req, reply) => {
  const { id } = req.params as any;
  const video = await getVideo(id);
  if (!video) return reply.code(404).send({ error: 'not_found' });
  return video;
});

app.post('/videos', async (req, reply) => {
  const isAdmin = req.headers['x-admin'] === '1';
  if (!isAdmin) {
    return reply.code(403).send({ error: 'admin_required' });
  }
  
  const videoData = req.body as any;
  
  if (!videoData.title || !videoData.description || !videoData.url) {
    return reply.code(400).send({ error: 'title, description, and url are required' });
  }
  
  const video = await createVideo(videoData);
  return reply.code(201).send(video);
});

// Trainings routes
app.get('/trainings', async (req) => {
  const filters = req.query as any;
  return listTrainings(filters);
});

app.get('/trainings/:id', async (req, reply) => {
  const { id } = req.params as any;
  const training = await getTraining(id);
  if (!training) return reply.code(404).send({ error: 'not_found' });
  return training;
});

app.post('/trainings/:id/enroll', async (req, reply) => {
  const { id } = req.params as any;
  const { name, email } = req.body as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!name || !email) {
    return reply.code(400).send({ error: 'name and email are required' });
  }
  
  const enrollment = await enroll({
    userId,
    trainingId: id,
    name,
    email
  });
  
  if (!enrollment) return reply.code(404).send({ error: 'training_not_found' });
  
  return reply.code(201).send(enrollment);
});

app.post('/trainings/:id/progress', async (req, reply) => {
  const { id } = req.params as any;
  const { lessonId, status } = req.body as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!lessonId || !status || !['complete', 'incomplete'].includes(status)) {
    return reply.code(400).send({ error: 'lessonId and status (complete|incomplete) are required' });
  }
  
  const progress = await setProgress({
    userId,
    trainingId: id,
    lessonId,
    status
  });
  
  return progress;
});

app.get('/trainings/:id/progress', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  const progress = await getProgress({
    userId,
    trainingId: id
  });
  
  return progress;
});

// Projects routes
app.get('/projects', async (req) => {
  const filters = req.query as any;
  return listProjects(filters);
});

app.get('/projects/:id', async (req, reply) => {
  const { id } = req.params as any;
  const project = await getProject(id);
  if (!project) return reply.code(404).send({ error: 'not_found' });
  return project;
});

app.post('/projects/:id/save', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  const result = await saveProject({ userId, projectId: id });
  
  return reply.code(result.isNew ? 201 : 200).send(result.saved);
});

app.get('/me/saved-projects', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return listSaved(userId);
});

// Bid Rooms routes
app.post('/bid-rooms', async (req, reply) => {
  const { projectId, name } = req.body as any;
  const ownerId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!projectId || !name) {
    return reply.code(400).send({ error: 'projectId and name are required' });
  }
  
  const bidRoom = await createBidRoom({ projectId, name, ownerId });
  return reply.code(201).send(bidRoom);
});

app.get('/bid-rooms', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return listBidRooms(userId);
});

app.get('/bid-rooms/:id', async (req, reply) => {
  const { id } = req.params as any;
  const bidRoom = await getBidRoom(id);
  if (!bidRoom) return reply.code(404).send({ error: 'not_found' });
  
  // Include artifacts and tasks
  const artifacts = await getRoomArtifacts(id);
  const tasks = await getRoomTasks(id);
  
  return {
    ...bidRoom,
    artifacts,
    tasks
  };
});

app.post('/bid-rooms/:id/artifacts', async (req, reply) => {
  const { id } = req.params as any;
  const { name, url } = req.body as any;
  
  if (!name) {
    return reply.code(400).send({ error: 'name is required' });
  }
  
  const artifact = await addArtifact({ roomId: id, name, url });
  return reply.code(201).send(artifact);
});

app.post('/bid-rooms/:id/tasks', async (req, reply) => {
  const { id } = req.params as any;
  const { title, assignee, dueAt } = req.body as any;
  
  if (!title) {
    return reply.code(400).send({ error: 'title is required' });
  }
  
  const task = await addTask({ roomId: id, title, assignee, dueAt });
  return reply.code(201).send(task);
});

app.post('/bid-rooms/:id/invite', async (req, reply) => {
  const { id } = req.params as any;
  const { userId, email } = req.body as any;
  
  if (!userId && !email) {
    return reply.code(400).send({ error: 'userId or email is required' });
  }
  
  const room = await inviteMember({ roomId: id, userId, email });
  if (!room) return reply.code(404).send({ error: 'room_not_found' });
  
  return room;
});

// Lounge routes
app.get('/lounge/rooms', async () => {
  return listRooms();
});

app.get('/lounge/rooms/:id', async (req, reply) => {
  const { id } = req.params as any;
  const room = await getRoom(id);
  if (!room) return reply.code(404).send({ error: 'room_not_found' });
  return room;
});

app.get('/lounge/rooms/:id/messages', async (req, reply) => {
  const { id } = req.params as any;
  const { since } = req.query as any;
  
  // Check if room exists
  const room = await getRoom(id);
  if (!room) return reply.code(404).send({ error: 'room_not_found' });
  
  const sinceEpochMs = since ? parseInt(since, 10) : undefined;
  const messages = await listMessages(id, sinceEpochMs);
  
  return {
    items: messages,
    now: Date.now()
  };
});

app.post('/lounge/rooms/:id/messages', async (req, reply) => {
  const { id } = req.params as any;
  const { text } = req.body as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!text || typeof text !== 'string') {
    return reply.code(400).send({ error: 'text is required' });
  }
  
  try {
    const message = await postMessage(id, { userId, text });
    return reply.code(201).send(message);
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found') {
      return reply.code(404).send({ error: 'room_not_found' });
    }
    if (error instanceof Error && error.message === 'Message text cannot be empty') {
      return reply.code(400).send({ error: 'text_cannot_be_empty' });
    }
    throw error;
  }
});

// Inbox routes
app.get('/inbox', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return listNotifications(userId);
});

app.post('/inbox/:id/read', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  const success = await markRead(userId, id);
  if (!success) {
    return reply.code(404).send({ error: 'notification_not_found' });
  }
  
  return { success: true };
});

app.post('/inbox', async (req, reply) => {
  const isAdmin = req.headers['x-admin'] === '1';
  if (!isAdmin) {
    return reply.code(401).send({ error: 'admin_required' });
  }
  
  const { userId, type, title, body } = req.body as any;
  
  if (!userId || !title || !body) {
    return reply.code(400).send({ error: 'userId, title, and body are required' });
  }
  
  try {
    const notification = await createNotification({ userId, type, title, body });
    return reply.code(201).send(notification);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Title is required' || error.message === 'Body is required')) {
      return reply.code(400).send({ error: error.message });
    }
    throw error;
  }
});

// Gamification routes
app.get('/me/points', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const points = await getPoints(userId);
  return { points };
});

app.get('/me/badges', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return listMyBadges(userId);
});

app.get('/leaderboard', async (req) => {
  const { limit } = req.query as any;
  const limitNum = limit ? parseInt(limit, 10) : 10;
  return listLeaderboard(limitNum);
});

app.post('/events', async (req, reply) => {
  const { type, refId } = req.body as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (!type) {
    return reply.code(400).send({ error: 'type is required' });
  }
  
  const event = await logEvent(userId, type, refId);
  return reply.code(201).send(event);
});

app.post('/points', async (req, reply) => {
  const isAdmin = req.headers['x-admin'] === '1';
  if (!isAdmin) {
    return reply.code(401).send({ error: 'admin_required' });
  }
  
  const { userId, amount, reason } = req.body as any;
  
  if (!userId || typeof amount !== 'number') {
    return reply.code(400).send({ error: 'userId and amount are required' });
  }
  
  const newTotal = await addPoints(userId, amount, { reason });
  return reply.code(201).send({ points: newTotal });
});

// Quiz routes
app.get('/quiz/today', async () => {
  const quiz = await getTodayQuiz();
  if (!quiz) {
    return { error: 'no_quiz_available' };
  }
  return quiz;
});

app.get('/quiz/:id', async (req, reply) => {
  const { id } = req.params as any;
  const quiz = await getQuizById(id);
  if (!quiz) return reply.code(404).send({ error: 'quiz_not_found' });
  return quiz;
});

app.get('/quiz/:id/my-response', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  const response = await getMyResponse(userId, id);
  if (!response) return reply.code(404).send({ error: 'no_response_found' });
  
  return response;
});

app.post('/quiz/:id/answer', async (req, reply) => {
  const { id } = req.params as any;
  const { choiceIndex } = req.body as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  if (typeof choiceIndex !== 'number') {
    return reply.code(400).send({ error: 'choiceIndex must be a number' });
  }
  
  try {
    const result = await submitResponse({
      userId,
      quizId: id,
      choiceIndex
    });
    
    if (!result) {
      return reply.code(404).send({ error: 'quiz_not_found' });
    }
    
    return reply.code(201).send({
      correct: result.isCorrect,
      response: result.response
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'You have already answered this quiz') {
      return reply.code(409).send({ error: 'already_answered' });
    }
    if (error instanceof Error && error.message === 'Invalid choice index') {
      return reply.code(400).send({ error: 'invalid_choice_index' });
    }
    throw error;
  }
});

app.get('/quiz/:id/stats', async (req, reply) => {
  const { id } = req.params as any;
  const stats = await getStats(id);
  return stats;
});

app.get('/quiz/history', async (req) => {
  const { limit } = req.query as any;
  const limitNum = limit ? parseInt(limit, 10) : 14;
  return getHistory(limitNum);
});

// Water Minute routes
app.get('/water-minute/today', async () => {
  const minute = await getTodayWaterMinute();
  if (!minute) {
    return { error: 'no_minute_available' };
  }
  return minute;
});

app.get('/water-minute/history', async (req) => {
  const { limit } = req.query as any;
  const limitNum = limit ? parseInt(limit, 10) : 14;
  return getWaterMinuteHistory(limitNum);
});

app.get('/water-minute/:id', async (req, reply) => {
  const { id } = req.params as any;
  const minute = await getWaterMinuteById(id);
  if (!minute) return reply.code(404).send({ error: 'minute_not_found' });
  return minute;
});

// Credentials routes
app.get('/credentials', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return listCredentials(userId);
});

app.post('/credentials', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const data = req.body as any;
  
  try {
    const credential = await addCredential(userId, data);
    return reply.code(201).send(credential);
  } catch (error) {
    if (error instanceof Error && error.message === 'Name is required') {
      return reply.code(400).send({ error: error.message });
    }
    throw error;
  }
});

app.patch('/credentials/:id', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const patch = req.body as any;
  
  const credential = await updateCredential(userId, id, patch);
  if (!credential) return reply.code(404).send({ error: 'credential_not_found' });
  
  return credential;
});

app.delete('/credentials/:id', async (req, reply) => {
  const { id } = req.params as any;
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  
  const success = await deleteCredential(userId, id);
  if (!success) return reply.code(404).send({ error: 'credential_not_found' });
  
  return reply.code(204).send();
});

app.get('/me/resume', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return getResume(userId);
});

app.put('/me/resume', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const data = req.body as any;
  
  const resume = await setResume(userId, data);
  return resume;
});

app.get('/me/card', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return getCard(userId);
});

app.put('/me/card', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const patch = req.body as any;
  
  const card = await setCard(userId, patch);
  return card;
});

// Admin routes
app.get('/admin/flags', async () => {
  return getFlags();
});

app.put('/admin/flags', async (req, reply) => {
  const isAdmin = req.headers['x-admin'] === '1';
  if (!isAdmin) {
    return reply.code(401).send({ error: 'admin_required' });
  }
  
  const patch = req.body as any;
  const updatedFlags = await setFlags(patch);
  return updatedFlags;
});

// User settings routes
app.get('/me/settings', async (req) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  return getUserSettings(userId);
});

app.put('/me/settings', async (req, reply) => {
  const userId = (req.headers['x-user-id'] as string) || 'u1';
  const patch = req.body as any;
  
  const settings = await setUserSettings(userId, patch);
  return settings;
});

// App settings routes
app.get('/public/app-settings', async () => {
  return getPublicAppSettings();
});

app.get('/admin/app-settings', async () => {
  return getAppSettings();
});

app.put('/admin/app-settings', async (req, reply) => {
  const isAdmin = req.headers['x-admin'] === '1';
  if (!isAdmin) {
    return reply.code(401).send({ error: 'admin_required' });
  }
  
  const patch = req.body as any;
  const settings = await setAppSettings(patch);
  return settings;
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('API listening on', port);
});