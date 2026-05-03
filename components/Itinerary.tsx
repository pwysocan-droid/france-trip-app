'use client';

import { useState, useEffect } from 'react';
import type { TripData, Place, TripDay, TripBase } from '@/types';

interface ItineraryProps {
  trip: TripData;
  places: Place[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onSelectPlace: (placeId: string) => void;
}

const REGION_ABBR: Record<string, string> = {
  riviera: 'Riviera',
  var: 'Var',
  'cote-bleue': 'Côte Bleue',
  luberon: 'Luberon',
  languedoc: 'Languedoc',
  'languedoc-coast': 'Sète',
};

function regionForDay(day: TripDay, bases: TripBase[], places: Place[]): string {
  const base = bases.find((b) => b.nights.includes(day.day));
  if (base) return REGION_ABBR[base.region] || base.region;

  // Fallback: inspect first stop's region (covers checkout/transit days
  // that have no sleep base, e.g. final-day departures).
  const ids = day.stops.map((s) => s.placeId);
  const stopPlaces = places.filter((p) => ids.includes(p.id));
  for (const p of stopPlaces) {
    if (p.subRegion === 'var') return 'Var';
    if (p.subRegion === 'vaucluse') return 'Luberon';
    if (p.subRegion === 'alpes-maritimes') return 'Riviera';
    if (p.subRegion === 'gard') return 'Languedoc';
    if (p.subRegion === 'herault' || p.subRegion === 'aude') return 'Sète';
    if (p.id === 'cassis' || p.id === 'tuba-club') return 'Côte Bleue';
    if (p.subRegion === 'bouches-du-rhone') return 'Provence';
  }
  return '—';
}

export default function Itinerary({
  trip,
  places,
  selectedDay,
  onSelectDay,
  onSelectPlace,
}: ItineraryProps) {
  const placesById = Object.fromEntries(places.map((p) => [p.id, p]));

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: 'var(--cream)' }}
    >
      {/* Drawer header */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: 'var(--cream)',
          padding: '12px 16px 12px',
          borderBottom: '0.5px solid var(--hair)',
        }}
      >
        <p
          className="t-mono"
          style={{
            fontSize: '10px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            margin: 0,
          }}
        >
          Itinerary · {trip.days.length} days · {trip.bases.length} bases
        </p>
        <h1
          className="t-display hidden md:block"
          style={{ fontSize: '17px', margin: '3px 0 0', letterSpacing: '-0.02em' }}
        >
          {trip.title}
        </h1>
        <p
          className="t-mono hidden md:block"
          style={{ fontSize: '10px', color: 'var(--ink-soft)', margin: '3px 0 0' }}
        >
          {trip.dates.start} → {trip.dates.end}
        </p>
        <p
          className="hidden md:block"
          style={{
            fontSize: '11px',
            color: 'var(--ink-mid)',
            fontStyle: 'italic',
            marginTop: '6px',
            lineHeight: 1.4,
          }}
        >
          {trip.subtitle}
        </p>
      </div>

      {/* Days */}
      <div style={{ padding: '12px 14px' }}>
        {trip.days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            isSelected={day.day === selectedDay}
            onSelect={() => onSelectDay(day.day)}
            placesById={placesById}
            onSelectPlace={onSelectPlace}
            regionLabel={regionForDay(day, trip.bases, places)}
          />
        ))}
      </div>

      {/* Open decisions */}
      {trip.openDecisions.length > 0 && (
        <div
          style={{
            padding: '14px 16px',
            borderTop: '0.5px solid var(--hair)',
            background: 'var(--cream-soft)',
          }}
        >
          <p
            className="t-mono"
            style={{
              fontSize: '10px',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              margin: '0 0 8px',
            }}
          >
            Open decisions
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trip.openDecisions
              .filter((d) => d.urgency === 'high')
              .map((d) => (
                <li
                  key={d.id}
                  style={{
                    fontSize: '11px',
                    color: 'var(--ink)',
                    marginBottom: '5px',
                    paddingLeft: '12px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--status-locked)',
                      fontWeight: 600,
                    }}
                  >
                    ●
                  </span>
                  {d.question}
                </li>
              ))}
            {trip.openDecisions
              .filter((d) => d.urgency !== 'high')
              .map((d) => (
                <li
                  key={d.id}
                  style={{
                    fontSize: '11px',
                    color: 'var(--ink-mid)',
                    marginBottom: '5px',
                    paddingLeft: '12px',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', left: 0, color: 'var(--ink-soft)' }}>○</span>
                  {d.question}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Bookings priority */}
      <div
        style={{
          padding: '14px 16px 24px',
          borderTop: '0.5px solid var(--hair)',
        }}
      >
        <p
          className="t-mono"
          style={{
            fontSize: '10px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            margin: '0 0 8px',
          }}
        >
          Bookings · priority order
        </p>
        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {trip.bookingsToLock.slice(0, 8).map((b) => (
            <li
              key={b.priority}
              className="t-mono"
              style={{
                fontSize: '11px',
                color: 'var(--ink)',
                marginBottom: '4px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <span
                style={{
                  color: 'var(--ink-faint)',
                  minWidth: '18px',
                  textAlign: 'right',
                }}
              >
                {String(b.priority).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>
                {b.what}
              </span>
            </li>
          ))}
          {trip.bookingsToLock.length > 8 && (
            <li
              style={{
                fontSize: '10px',
                color: 'var(--ink-soft)',
                fontStyle: 'italic',
                marginTop: '4px',
                paddingLeft: '26px',
              }}
            >
              + {trip.bookingsToLock.length - 8} more
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

function DayCard({
  day,
  isSelected,
  onSelect,
  placesById,
  onSelectPlace,
  regionLabel,
}: {
  day: TripDay;
  isSelected: boolean;
  onSelect: () => void;
  placesById: { [k: string]: Place };
  onSelectPlace: (placeId: string) => void;
  regionLabel: string;
}) {
  const [expanded, setExpanded] = useState(isSelected);

  // Auto-expand when selected externally
  useEffect(() => {
    setExpanded(isSelected);
  }, [isSelected]);

  return (
    <div
      style={{
        border: isSelected ? '1px solid var(--ink)' : '0.5px solid var(--hair-mid)',
        borderRadius: '4px',
        marginBottom: '8px',
        background: isSelected ? 'var(--paper)' : 'var(--cream-soft)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => {
          onSelect();
          setExpanded(!expanded);
        }}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '10px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div
          className="t-mono"
          style={{
            fontSize: '10px',
            color: isSelected ? 'var(--ink)' : 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            Day {String(day.day).padStart(2, '0')} · {day.weekday.slice(0, 3)} {day.date.slice(5)}
          </span>
          <span>{regionLabel}</span>
        </div>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--ink)',
            margin: '3px 0 0',
            letterSpacing: '-0.01em',
          }}
        >
          {day.title}
        </p>
        <p
          style={{
            fontSize: '11px',
            color: 'var(--ink-mid)',
            lineHeight: 1.45,
            marginTop: '4px',
          }}
        >
          {day.summary}
        </p>
      </button>

      {expanded && day.stops.length > 0 && (
        <div
          style={{
            borderTop: '0.5px solid var(--hair)',
            padding: '8px 10px 10px',
          }}
        >
          {day.stops.map((stop, idx) => {
            const place = placesById[stop.placeId];
            return (
              <button
                key={idx}
                onClick={() => onSelectPlace(stop.placeId)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  marginTop: idx === 0 ? 0 : '6px',
                  padding: '7px 8px',
                  border: '0.5px solid var(--hair)',
                  background: 'var(--cream-soft)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="t-mono"
                  style={{
                    fontSize: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{stop.time}</span>
                  <span style={{ color: 'var(--ink-soft)' }}>{stop.duration} min</span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--ink)',
                    margin: '3px 0 0',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {place?.name || stop.placeId}
                </p>
                {stop.notes && (
                  <p
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--ink-mid)',
                      lineHeight: 1.45,
                      marginTop: '3px',
                    }}
                  >
                    {stop.notes}
                  </p>
                )}
                <span
                  className="t-mono"
                  style={{
                    display: 'inline-block',
                    fontSize: '9px',
                    padding: '1px 6px',
                    marginTop: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: '0.5px solid',
                    background: stop.type === 'anchor' ? 'var(--ink)' : 'transparent',
                    color: stop.type === 'anchor' ? 'var(--cream)' : 'var(--ink-mid)',
                    borderColor: stop.type === 'anchor' ? 'var(--ink)' : 'var(--hair-strong)',
                    fontStyle: stop.type === 'optional' ? 'italic' : 'normal',
                  }}
                >
                  {stop.type}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
