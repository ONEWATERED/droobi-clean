import Fastify from 'fastify';
import cors from '@fastify/cors';
import { listTerms, getTerm } from './lexicon';
import { listOrgs, getOrg } from './directory';

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

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('API listening on', port);
});
