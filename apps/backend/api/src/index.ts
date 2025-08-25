import Fastify from 'fastify';
import cors from '@fastify/cors';
import { listTerms, getTerm } from './lexicon';
import { listOrgs, getOrg } from './directory';
import { getProfile, updateProfile } from './profiles';
import { listWebinars, getWebinar, registerForWebinar, logWebhookPayload } from './webinars';

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

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('API listening on', port);
});
