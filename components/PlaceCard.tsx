'use client';

import Link from 'next/link';
import type { Place } from '@/types';
import { colorForPlace } from './Map';

interface PlaceCardProps {
  place: Place;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
}

const REGION_LABELS: Record<string, string> = {
  riviera: 'Riviera',
  provence: 'Provence',
  languedoc: 'Languedoc',
};

const SUBREGION_LABELS: Record<string, string> = {
  'alpes-maritimes': 'Alpes-Maritimes',
  var: 'Var',
  'bouches-du-rhone': 'Bouches-du-Rhône',
  vaucluse: 'Vaucluse',
  gard: 'Gard',
  herault: 'Hérault',
  aude: 'Aude',
};

function formatRegion(place: Place): string {
  const sub = place.subRegion ? SUBREGION_LABELS[place.subRegion] || place.subRegion : null;
  const cat = place.category ? humanize(place.category) : null;
  return [sub, cat].filter(Boolean).join(' · ');
}

function humanize(s: string): string {
  return s
    .split('-')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

export default function PlaceCard({
  place,
  onClose,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: PlaceCardProps) {
  const color = colorForPlace(place);
  const isLocked = place.booking?.toLowerCase().startsWith('locked') ||
                   place.status === 'confirmed-loved' ||
                   place.booking?.toLowerCase().includes('locked');

  return (
    <div
      className="bg-white border shadow-2xl"
      style={{
        borderColor: 'var(--hair-mid)',
        borderRadius: '4px',
        boxShadow: '0 6px 20px rgba(26, 26, 26, 0.18)',
        padding: '12px 14px',
      }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p
            className="t-mono"
            style={{
              fontSize: '10px',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: color,
              }}
            />
            {formatRegion(place)}
          </p>
          <h3
            className="t-display"
            style={{ fontSize: '15px', margin: 0, lineHeight: 1.25 }}
          >
            {place.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-xl leading-none"
          style={{ color: 'var(--ink-soft)', marginTop: '-2px' }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '0.5px solid var(--hair)',
          paddingBottom: '8px',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      >
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="t-mono nav-btn"
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: onPrev ? 'pointer' : 'default',
            opacity: onPrev ? 1 : 0.4,
            maxWidth: '48%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left',
          }}
        >
          ← {prevLabel || 'Prev'}
        </button>
        <button
          onClick={onNext}
          disabled={!onNext}
          className="t-mono nav-btn"
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: onNext ? 'pointer' : 'default',
            opacity: onNext ? 1 : 0.4,
            maxWidth: '48%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'right',
          }}
        >
          {nextLabel || 'Next'} →
        </button>
      </div>

      {place.vibe && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--ink-mid)',
            lineHeight: 1.5,
            margin: '8px 0',
            letterSpacing: '-0.003em',
          }}
        >
          {place.vibe}
        </p>
      )}

      {place.tags && place.tags.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '4px', marginBottom: '8px' }}>
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="t-mono"
              style={{
                fontSize: '9px',
                border: '0.5px solid var(--hair-mid)',
                color: 'var(--ink-mid)',
                padding: '2px 6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {tag.split(':').pop()}
            </span>
          ))}
        </div>
      )}

      {isLocked && (
        <p
          className="t-mono"
          style={{
            fontSize: '10px',
            color: 'var(--status-locked)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '6px 0',
          }}
        >
          ◆ Locked — {place.booking || 'confirmed'}
        </p>
      )}

      <div className="flex" style={{ gap: '6px', marginTop: '10px' }}>
        <Link
          href={`/places/${place.id}`}
          className="t-mono text-center flex-1"
          style={{
            fontSize: '10px',
            padding: '6px 10px',
            border: '0.5px solid var(--ink)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            textDecoration: 'none',
          }}
        >
          More →
        </Link>
        {place.coordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates[1]},${place.coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="t-mono text-center flex-1"
            style={{
              fontSize: '10px',
              padding: '6px 10px',
              border: '0.5px solid var(--hair-strong)',
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              textDecoration: 'none',
            }}
          >
            Maps ↗
          </a>
        )}
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="t-mono text-center flex-1"
            style={{
              fontSize: '10px',
              padding: '6px 10px',
              border: '0.5px solid var(--hair-strong)',
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              textDecoration: 'none',
            }}
          >
            Call
          </a>
        )}
      </div>

      <style jsx>{`
        .nav-btn {
          color: var(--ink-mid);
        }
        .nav-btn:not(:disabled):hover,
        .nav-btn:not(:disabled):active {
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}
