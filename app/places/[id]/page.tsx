'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import placesData from '@/data/places.json';
import tripIndex from '@/data/trips/_index.json';
import type { Place, TripData, TripIndex } from '@/types';
import { colorForPlace } from '@/components/Map';

const places = (placesData as any).places as Place[];
const index = tripIndex as TripIndex;

const SUBREGION_LABELS: Record<string, string> = {
  'alpes-maritimes': 'Alpes-Maritimes',
  var: 'Var',
  'bouches-du-rhone': 'Bouches-du-Rhône',
  vaucluse: 'Vaucluse',
  gard: 'Gard',
  herault: 'Hérault',
  aude: 'Aude',
};

const REGION_LABELS: Record<string, string> = {
  riviera: 'Riviera',
  provence: 'Provence',
  languedoc: 'Languedoc',
};

function humanize(s: string): string {
  return s
    .split('-')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatRecoDate(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})/);
  if (!match) return date;
  const [, year, month] = match;
  const idx = parseInt(month, 10) - 1;
  if (idx < 0 || idx > 11) return date;
  return `${MONTH_NAMES[idx]} ${year}`;
}

function formatRecoContext(context: string): string {
  const spaced = context.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatBookingStatus(place: Place): { label: string; locked: boolean } {
  if (place.booking?.toLowerCase().startsWith('locked')) {
    return { label: '◆ Locked', locked: true };
  }
  if (place.booking?.toLowerCase().includes('locked')) {
    return { label: '◆ Locked', locked: true };
  }
  if (place.booking?.toLowerCase().includes('required')) {
    return { label: '◇ To book', locked: false };
  }
  if (place.booking?.toLowerCase().includes('recommended')) {
    return { label: 'Recommended', locked: false };
  }
  return { label: place.booking || 'Walk-in', locked: false };
}

interface TripReference {
  slug: string;
  title: string;
  status: string;
  days: { day: number; title: string }[];
}

async function findTripsReferencing(placeId: string): Promise<TripReference[]> {
  const refs: TripReference[] = [];
  for (const entry of index.trips) {
    try {
      const mod = await import(`@/data/trips/${entry.slug}.json`);
      const trip = mod.default as TripData;
      const matchingDays = trip.days
        .filter((d) => d.stops.some((s) => s.placeId === placeId))
        .map((d) => ({ day: d.day, title: d.title }));
      if (matchingDays.length > 0) {
        refs.push({
          slug: entry.slug,
          title: entry.title,
          status: entry.status,
          days: matchingDays,
        });
      }
    } catch {
      // Skip trips that fail to load
    }
  }
  return refs;
}

export default function PlacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const place = places.find((p) => p.id === id);

  if (!place) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--cream)',
          padding: '40px 20px',
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
          }}
        >
          ← Trips
        </Link>
        <h1 className="t-display" style={{ fontSize: '20px', marginTop: '20px' }}>
          Place not found
        </h1>
        <p style={{ color: 'var(--ink-mid)', marginTop: '8px', fontSize: '13px' }}>
          No entry exists for <code>{id}</code>.
        </p>
      </div>
    );
  }

  const color = colorForPlace(place);
  const status = formatBookingStatus(place);
  const [tripRefs, setTripRefs] = useState<TripReference[]>([]);

  useEffect(() => {
    let cancelled = false;
    findTripsReferencing(place.id).then((refs) => {
      if (!cancelled) setTripRefs(refs);
    });
    return () => {
      cancelled = true;
    };
  }, [place.id]);

  const subRegionLabel = place.subRegion
    ? SUBREGION_LABELS[place.subRegion] || humanize(place.subRegion)
    : null;
  const regionLabel = place.region ? REGION_LABELS[place.region] || humanize(place.region) : null;
  const eyebrow = [subRegionLabel || regionLabel, place.nearestTown, place.category && humanize(place.category)]
    .filter(Boolean)
    .join(' · ');

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid var(--hair)',
          position: 'sticky',
          top: 0,
          background: 'var(--cream)',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.back()}
          className="t-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        {tripRefs.length > 0 && (
          <div
            className="t-mono"
            style={{
              fontSize: '10px',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
            }}
          >
            {tripRefs[0].days
              .map((d) => `Day ${String(d.day).padStart(2, '0')}`)
              .join(' · ')}
          </div>
        )}
      </nav>

      <article
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '24px 20px 60px',
        }}
      >
        {/* Eyebrow with color dot */}
        <p
          className="t-mono"
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--ink-soft)',
            margin: '0 0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: color,
            }}
          />
          {eyebrow}
        </p>

        {/* Title */}
        <h1
          className="t-display"
          style={{
            fontSize: '28px',
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
          }}
        >
          {place.name}
        </h1>

        {/* Subtitle (extracted from vibe first sentence, if short) */}
        {place.vibe && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--ink-soft)',
              fontStyle: 'italic',
              margin: '6px 0 0',
              letterSpacing: '-0.005em',
            }}
          >
            {place.vibe.split('.')[0] + '.'}
          </p>
        )}

        {/* Status strip — 2x2 grid with hairlines */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--hair-mid)',
            border: '0.5px solid var(--hair-mid)',
            margin: '20px 0 22px',
          }}
        >
          <StripCell label="Status" value={place.status ? humanize(place.status) : '—'} />
          <StripCell
            label="Booking"
            value={status.label}
            highlighted={status.locked}
          />
          <StripCell
            label="Region"
            value={[subRegionLabel, regionLabel].filter(Boolean).join(' · ') || '—'}
          />
          <StripCell
            label="Trips"
            value={
              tripRefs.length > 0
                ? tripRefs.length === 1
                  ? `1 trip · ${tripRefs[0].days.length} day${tripRefs[0].days.length > 1 ? 's' : ''}`
                  : `${tripRefs.length} trips`
                : '— in library only'
            }
          />
        </div>

        {/* Trips list — only show if appears in any trip */}
        {tripRefs.length > 0 && (
          <div style={{ margin: '0 0 22px' }}>
            {tripRefs.map((ref) => (
              <Link
                key={ref.slug}
                href={`/trips/${ref.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    border: '0.5px solid var(--hair-mid)',
                    padding: '8px 12px',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--cream-soft)',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <p
                      className="t-mono"
                      style={{
                        fontSize: '9px',
                        color: 'var(--ink-soft)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.10em',
                        margin: 0,
                      }}
                    >
                      {ref.status === 'locked' ? '◆ ' : ''}
                      {ref.status}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--ink)',
                        margin: '2px 0 0',
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {ref.title}
                    </p>
                  </div>
                  <p
                    className="t-mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--ink-mid)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {ref.days.map((d) => `N° ${String(d.day).padStart(2, '0')}`).join(' · ')}{' '}
                    →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Vibe paragraph */}
        {place.vibe && (
          <p
            style={{
              fontSize: '15px',
              color: 'var(--ink)',
              lineHeight: 1.6,
              margin: '0 0 24px',
              letterSpacing: '-0.005em',
            }}
          >
            {place.vibe}
          </p>
        )}

        {/* Practical section */}
        <Section title="Practical" number="01">
          <DlRow dt="Address" dd={place.address || '—'} />
          {place.phone && <DlRow dt="Phone" dd={place.phone} />}
          {place.website && (
            <DlRow
              dt="Website"
              dd={
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--ink)', textDecoration: 'underline' }}
                >
                  {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              }
            />
          )}
          {place.booking && <DlRow dt="Booking" dd={place.booking} />}
          {place.practical && Object.entries(place.practical).map(([k, v]) => (
            <DlRow key={k} dt={humanize(k)} dd={String(v)} />
          ))}
        </Section>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <Section title="Tags" number="02">
            <div className="flex flex-wrap" style={{ gap: '5px' }}>
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="t-mono"
                  style={{
                    fontSize: '10px',
                    border: '0.5px solid var(--hair-mid)',
                    color: 'var(--ink-mid)',
                    padding: '3px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {tag.replace(':', ' · ')}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Recommendations */}
        {place.recommendations && place.recommendations.length > 0 && (
          <Section title="Recommendations" number="03">
            {place.recommendations.map((reco, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: '1px solid var(--ink)',
                  paddingLeft: '12px',
                  marginBottom: '14px',
                }}
              >
                <p
                  className="t-mono"
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.10em',
                    color: 'var(--ink-soft)',
                    margin: '0 0 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <span style={{ color: 'var(--ink)' }}>
                    {humanize(reco.source)}
                  </span>
                  <span>
                    {formatRecoDate(reco.date)}
                    {reco.context && ` · ${formatRecoContext(reco.context)}`}
                  </span>
                </p>
                {reco.note && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink)',
                      lineHeight: 1.55,
                      margin: 0,
                      letterSpacing: '-0.003em',
                    }}
                  >
                    {reco.note}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Narrative (the markdown body from the place file) */}
        {place.narrative && (
          <Section title="Notes" number="04">
            <div
              style={{
                fontSize: '14px',
                color: 'var(--ink)',
                lineHeight: 1.7,
                letterSpacing: '-0.003em',
                whiteSpace: 'pre-wrap',
              }}
            >
              {place.narrative.replace(/^# .+\n/, '').trim()}
            </div>
          </Section>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: place.coordinates && place.website ? '1fr 1fr' : '1fr',
            gap: '8px',
            marginTop: '32px',
          }}
        >
          {place.coordinates && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates[1]},${place.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="t-mono text-center"
              style={{
                fontSize: '11px',
                padding: '12px 14px',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                border: '0.5px solid var(--hair-strong)',
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              Open in Maps ↗
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="t-mono text-center"
              style={{
                fontSize: '11px',
                padding: '12px 14px',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                border: '0.5px solid var(--ink)',
                background: 'var(--ink)',
                color: 'var(--cream)',
                textDecoration: 'none',
              }}
            >
              Website ↗
            </a>
          )}
        </div>
      </article>
    </main>
  );
}

function StripCell({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--cream)',
        padding: '8px 12px',
      }}
    >
      <p
        className="t-mono"
        style={{
          fontSize: '9px',
          color: 'var(--ink-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          margin: '0 0 2px',
        }}
      >
        {label}
      </p>
      <p
        className="t-mono"
        style={{
          fontSize: '11px',
          color: highlighted ? 'var(--status-locked)' : 'var(--ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0,
          fontWeight: highlighted ? 500 : 400,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '0.5px solid var(--hair)',
      }}
    >
      <h2
        className="t-mono"
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--ink-soft)',
          margin: '0 0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 400,
        }}
      >
        <span>{title}</span>
        <span style={{ color: 'var(--ink-faint)' }}>{number}</span>
      </h2>
      {children}
    </section>
  );
}

function DlRow({ dt, dd }: { dt: string; dd: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr',
        gap: '12px',
        padding: '4px 0',
      }}
    >
      <span
        className="t-mono"
        style={{
          fontSize: '10px',
          color: 'var(--ink-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          paddingTop: '2px',
        }}
      >
        {dt}
      </span>
      <span
        className="t-mono"
        style={{
          fontSize: '12px',
          color: 'var(--ink)',
          letterSpacing: 0,
        }}
      >
        {dd}
      </span>
    </div>
  );
}
