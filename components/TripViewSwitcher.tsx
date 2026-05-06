import Link from 'next/link';
import tripIndex from '@/data/trips/_index.json';
import type { TripIndex } from '@/types';

const VIEW_LABELS: Record<string, string> = {
  outline: 'Outline',
  reservations: 'Reservations',
  map: 'Map',
};

function viewHref(slug: string, view: string): string {
  if (view === 'map') return `/trips/${slug}`;
  return `/trips/${slug}/${view}`;
}

function viewLabel(view: string): string {
  return VIEW_LABELS[view] || view.charAt(0).toUpperCase() + view.slice(1);
}

export default function TripViewSwitcher({
  tripSlug,
  currentView,
}: {
  tripSlug: string;
  currentView: string;
}) {
  const index = tripIndex as TripIndex;
  const entry = index.trips.find((t) => t.slug === tripSlug);
  if (!entry) return null;

  const views: string[] = [];
  if (entry.view) views.push(entry.view);
  if (entry.secondaryViews) {
    for (const v of entry.secondaryViews) {
      if (!views.includes(v)) views.push(v);
    }
  }

  if (views.length < 2) return null;

  return (
    <>
      <p
        className="t-mono"
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          color: 'var(--ink-soft)',
          margin: '0 0 28px',
        }}
      >
        {views.map((v, i) => (
          <span key={v}>
            {i > 0 && ' · '}
            {v === currentView ? (
              <span style={{ color: 'var(--ink)' }}>{viewLabel(v)}</span>
            ) : (
              <Link
                href={viewHref(tripSlug, v)}
                className="trip-view-switcher-link"
              >
                {viewLabel(v)}
              </Link>
            )}
          </span>
        ))}
      </p>
      <style>{`
        .trip-view-switcher-link {
          color: var(--ink-soft);
          text-decoration: none;
        }
        .trip-view-switcher-link:hover {
          color: var(--ink);
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
