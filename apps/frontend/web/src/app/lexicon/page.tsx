import Link from 'next/link';

async function getTerms(search?: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = new URL(`${base}/lexicon/terms`);
  if (search) url.searchParams.set('search', search);
  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}

export default async function LexiconPage({ searchParams }: { searchParams: { q?: string }}) {
  const q = searchParams?.q || '';
  const terms = await getTerms(q);
  return (
    <main className="max-w-4xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Lexicon</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search terms" className="border rounded px-3 py-2 w-full"/>
        <button className="border rounded px-4">Search</button>
      </form>
      <ul className="grid gap-2">
        {terms.map((t: any) => (
          <li key={t.id} className="border rounded p-3 hover:bg-gray-50">
            <Link href={`/lexicon/${t.id}`} className="font-semibold">{t.title}</Link>
            {t.tags?.length ? <div className="text-xs text-muted-foreground">{t.tags.join(', ')}</div> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
