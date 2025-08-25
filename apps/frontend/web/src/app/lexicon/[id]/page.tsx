async function getTerm(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/lexicon/terms/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
export default async function TermDetail({ params }: { params: { id: string } }) {
  const term = await getTerm(params.id);
  if (!term) return <main className="p-6">Not found.</main>;
  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-3">
      <h1 className="text-2xl font-bold">{term.title}</h1>
      <p>{term.body}</p>
      {term.sources?.length ? <div className="text-sm text-muted-foreground">Sources: {term.sources.join(', ')}</div> : null}
    </main>
  );
}
