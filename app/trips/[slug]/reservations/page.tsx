import { notFound } from 'next/navigation';
import Link from 'next/link';
import tripIndex from '@/data/trips/_index.json';
import type { TripIndex, ReservationsData } from '@/types';
import ReservationsTable from '@/components/ReservationsTable';

export default async function ReservationsPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const index = tripIndex as TripIndex;
  const entry = index.trips.find((t) => t.slug === slug);

  if (
    !entry ||
    !entry.reservationsFile ||
    !entry.secondaryViews?.includes('reservations')
  ) {
    notFound();
  }

  let data: ReservationsData;
  try {
    // Webpack bundles all matching files under data/trips/, so the dynamic
    // segment is safe and works in serverless functions without any
    // outputFileTracingIncludes wiring.
    const fileNameNoExt = entry.reservationsFile.replace(/\.json$/, '');
    const mod = await import(`@/data/trips/${fileNameNoExt}.json`);
    data = mod.default as ReservationsData;
  } catch {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '24px 24px 60px',
        }}
      >
        <Link
          href="/"
          className="t-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          ← All trips
        </Link>

        <ReservationsTable data={data} />
      </div>
    </main>
  );
}
