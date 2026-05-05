'use client';

import Link from 'next/link';
import tripIndex from '@/data/trips/_index.json';
import type { TripIndex, TripIndexEntry } from '@/types';
import { REGION_COLORS } from '@/components/Map';

const index = tripIndex as TripIndex;

const STATUS_LABELS: Record<string, string> = {
  planning: 'In planning',
  draft: 'Draft',
  locked: 'Locked',
  past: 'Past',
  superseded: 'Superseded',
};

const STATUS_COLORS: Record<string, string> = {
  planning: 'var(--ink)',
  draft: 'var(--ink-soft)',
  locked: 'var(--color-riviera)',
  past: 'var(--ink-faint)',
  superseded: 'var(--ink-soft)',
};

function formatDateRange(start: string, end: string): string {
  // 2026-06-09 → 2026-06-19  becomes  Jun 9 → 19, 2026
  const s = new Date(start);
  const e = new Date(end);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${months[s.getMonth()]} ${s.getDate()} → ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${months[s.getMonth()]} ${s.getDate()} → ${months[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
}

function regionColor(region: string): string {
  // Some trip-level regions (like 'bordeaux', 'cap-ferret') don't have a
  // landscape color yet — fall back to a neutral.
  return (REGION_COLORS as Record<string, string>)[region] || '#6F6B62';
}

function humanizeRegion(region: string): string {
  const labels: Record<string, string> = {
    riviera: 'Riviera',
    var: 'Var',
    'cote-bleue': 'Côte Bleue',
    luberon: 'Luberon',
    languedoc: 'Languedoc',
    'languedoc-coast': 'Sète',
    bordeaux: 'Bordeaux',
    'cap-ferret': 'Cap Ferret',
  };
  return labels[region] || region;
}

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        padding: '32px 20px 60px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Eyebrow */}
        <p
          className="t-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 8px',
          }}
        >
          Library · {index.trips.length} trips
        </p>

        {/* Title */}
        <h1
          className="t-display"
          style={{
            fontSize: '32px',
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
          }}
        >
          Trips
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--ink-soft)',
            fontStyle: 'italic',
            margin: '6px 0 32px',
            letterSpacing: '-0.005em',
          }}
        >
          A growing library. Pick a trip to view its map and itinerary.
        </p>

        {/* Trip cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {index.trips.map((trip) => (
            <TripCard key={trip.slug} trip={trip} />
          ))}
        </div>

        {/* Footer hint */}
        <p
          className="t-mono"
          style={{
            fontSize: '10px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '0.5px solid var(--hair)',
          }}
        >
          Add new trip · drop JSON in <span style={{ color: 'var(--ink)' }}>data/trips/</span> · register in <span style={{ color: 'var(--ink)' }}>_index.json</span>
        </p>
      </div>
    </main>
  );
}

function TripCard({ trip }: { trip: TripIndexEntry }) {
  const href =
    trip.view === 'outline' ? `/trips/${trip.slug}/outline` : `/trips/${trip.slug}`;
  const isSuperseded = trip.status === 'superseded';
  const dateLabel = trip.dateRange
    ? trip.dateRange
    : trip.dates
    ? formatDateRange(trip.dates.start, trip.dates.end)
    : '';
  const description = trip.subtitle || trip.summary || '';
  const showRegionRow =
    trip.regions && trip.regions.length > 0 && trip.nights != null && trip.bases != null;
  const baseOpacity = isSuperseded ? 0.65 : 1;

  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
    >
      <article
        style={{
          background: 'var(--paper)',
          border: '0.5px solid var(--hair-mid)',
          borderRadius: '4px',
          padding: '18px 20px',
          transition: 'border-color 0.15s ease, opacity 0.15s ease',
          cursor: 'pointer',
          opacity: baseOpacity,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--ink)';
          if (isSuperseded) e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--hair-mid)';
          if (isSuperseded) e.currentTarget.style.opacity = String(baseOpacity);
        }}
      >
        {/* Top row: status + dates */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
            gap: '12px',
          }}
        >
          <p
            className="t-mono"
            style={{
              fontSize: '10px',
              color: STATUS_COLORS[trip.status] || 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              margin: 0,
              fontWeight: 500,
              ...(isSuperseded
                ? {
                    borderTop: '0.5px solid var(--hair)',
                    paddingTop: '6px',
                  }
                : {}),
            }}
          >
            {trip.status === 'locked' ? '◆ ' : ''}
            {STATUS_LABELS[trip.status] || trip.status}
          </p>
          {dateLabel && (
            <p
              className="t-mono"
              style={{
                fontSize: '10px',
                color: 'var(--ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {dateLabel}
            </p>
          )}
        </div>

        {/* Title */}
        <h2
          className="t-display"
          style={{
            fontSize: '19px',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {trip.title}
        </h2>

        {/* Description (subtitle on outline trips, summary on map trips) */}
        {description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--ink-mid)',
              lineHeight: 1.5,
              margin: '0 0 12px',
              letterSpacing: '-0.005em',
            }}
          >
            {description}
          </p>
        )}

        {/* Bottom row: regions + nights/bases — only for trips with that data */}
        {showRegionRow && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {trip.regions!.map((r) => (
                <span
                  key={r}
                  className="t-mono"
                  style={{
                    fontSize: '9px',
                    color: 'var(--ink-mid)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: regionColor(r),
                    }}
                  />
                  {humanizeRegion(r)}
                </span>
              ))}
            </div>

            <p
              className="t-mono"
              style={{
                fontSize: '10px',
                color: 'var(--ink-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {trip.nights} nights · {trip.bases} bases →
            </p>
          </div>
        )}
      </article>
    </Link>
  );
}
