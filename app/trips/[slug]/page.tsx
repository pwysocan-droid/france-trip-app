'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Itinerary from '@/components/Itinerary';
import PlaceCard from '@/components/PlaceCard';
import placesData from '@/data/places.json';
import type { Place, TripData } from '@/types';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const places = (placesData as any).places as Place[];

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showItinerary, setShowItinerary] = useState(false);

  // Dynamically import the trip JSON by slug. This pattern lets you
  // add new trips by dropping a file into data/trips/ — no app code changes.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import(`@/data/trips/${slug}.json`);
        if (!cancelled) setTrip(mod.default as TripData);
      } catch (err) {
        if (!cancelled) setLoadError(`Trip not found: ${slug}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const highlightedPlaceIds = useMemo(() => {
    if (!trip) return [];
    const day = trip.days.find((d) => d.day === selectedDay);
    return day ? day.stops.map((s) => s.placeId) : [];
  }, [selectedDay, trip]);

  const routeOrder = useMemo(() => {
    if (!trip) return [];
    const order: string[] = [];
    trip.days.forEach((day) => {
      day.stops.forEach((stop) => {
        if (!order.includes(stop.placeId)) order.push(stop.placeId);
      });
    });
    return order;
  }, [trip]);

  const tripPlaceIds = useMemo(() => {
    if (!trip) return new Set<string>();
    const ids = new Set<string>();
    trip.days.forEach((d) => d.stops.forEach((s) => ids.add(s.placeId)));
    return ids;
  }, [trip]);

  const tripPlaces = useMemo(
    () => places.filter((p) => tripPlaceIds.has(p.id)),
    [tripPlaceIds]
  );

  const selectedPlace = selectedPlaceId
    ? places.find((p) => p.id === selectedPlaceId) || null
    : null;

  const orderedStops = useMemo(() => {
    if (!trip) return [] as { placeId: string; day: number; place: Place }[];
    const stops: { placeId: string; day: number; place: Place }[] = [];
    trip.days.forEach((day) => {
      day.stops.forEach((stop) => {
        const place = places.find((p) => p.id === stop.placeId);
        if (place) stops.push({ placeId: stop.placeId, day: day.day, place });
      });
    });
    return stops;
  }, [trip]);

  const navContext = useMemo(() => {
    if (!selectedPlaceId || orderedStops.length === 0) return null;
    let index = orderedStops.findIndex(
      (s) => s.placeId === selectedPlaceId && s.day === selectedDay
    );
    if (index === -1) {
      index = orderedStops.findIndex((s) => s.placeId === selectedPlaceId);
    }
    if (index === -1) return null;
    const len = orderedStops.length;
    return {
      prev: orderedStops[(index - 1 + len) % len],
      next: orderedStops[(index + 1) % len],
    };
  }, [selectedPlaceId, selectedDay, orderedStops]);

  const formatNavLabel = (entry: { day: number; place: Place }) =>
    `Day ${entry.day} · ${entry.place.name}`;

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const mapPadding = useMemo(() => {
    if (isDesktop) {
      return { top: 60, bottom: 60, left: 60, right: 60 };
    }
    if (showItinerary && typeof window !== 'undefined') {
      return {
        top: 80,
        bottom: window.innerHeight * 0.6 + 80,
        left: 40,
        right: 40,
      };
    }
    return { top: 100, bottom: 80, left: 40, right: 40 };
  }, [isDesktop, showItinerary]);

  if (loadError) {
    return (
      <main
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
          ← All trips
        </Link>
        <h1
          className="t-display"
          style={{ fontSize: '22px', marginTop: '20px', letterSpacing: '-0.02em' }}
        >
          Trip not found
        </h1>
        <p style={{ color: 'var(--ink-mid)', marginTop: '8px', fontSize: '13px' }}>
          {loadError}
        </p>
      </main>
    );
  }

  if (!trip) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          className="t-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
          }}
        >
          Loading…
        </p>
      </main>
    );
  }

  return (
    <main
      className="h-screen w-full flex flex-col md:flex-row overflow-hidden"
      style={{ background: 'var(--cream)' }}
    >
      <div className="flex-1 relative">
        <Map
          places={tripPlaces}
          highlightedPlaceIds={highlightedPlaceIds}
          focusBoundsIds={highlightedPlaceIds}
          routeOrder={routeOrder}
          onPlaceClick={(p) => setSelectedPlaceId(p.id)}
          selectedPlaceId={selectedPlaceId}
          padding={mapPadding}
        />

        {/* Mobile floating header with All Trips back link */}
        <div
          className="absolute top-0 left-0 right-0 md:hidden z-10"
          style={{
            background: 'rgba(248, 245, 239, 0.94)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: '10px 14px',
            borderBottom: '0.5px solid var(--hair-mid)',
          }}
        >
          <button
            onClick={() => router.push('/')}
            className="t-mono"
            style={{
              fontSize: '9px',
              color: 'var(--ink-soft)',
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            ← All trips
          </button>
          <p
            className="t-display"
            style={{ fontSize: '13px', margin: '4px 0 0', letterSpacing: '-0.015em' }}
          >
            {trip.title}
          </p>
        </div>

        {/* Desktop floating "all trips" pill */}
        <button
          onClick={() => router.push('/')}
          className="hidden md:block absolute z-10 t-mono"
          style={{
            top: '14px',
            left: '14px',
            background: 'rgba(248, 245, 239, 0.94)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '0.5px solid var(--hair-mid)',
            padding: '6px 12px',
            fontSize: '10px',
            color: 'var(--ink)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            cursor: 'pointer',
          }}
        >
          ← All trips
        </button>

        {/* Mobile itinerary CTA */}
        <button
          onClick={() => setShowItinerary(!showItinerary)}
          className="md:hidden absolute z-20 t-mono"
          style={{
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            padding: '8px 18px',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showItinerary ? 'Map ←' : 'Itinerary →'}
        </button>

        {selectedPlace && (
          <div
            className="absolute z-30"
            style={{
              left: '14px',
              right: '14px',
              bottom: showItinerary ? 'calc(60vh + 12px)' : '74px',
              maxWidth: '420px',
            }}
          >
            <PlaceCard
              place={selectedPlace}
              onClose={() => setSelectedPlaceId(null)}
              onPrev={
                navContext
                  ? () => {
                      setSelectedPlaceId(navContext.prev.placeId);
                      setSelectedDay(navContext.prev.day);
                    }
                  : undefined
              }
              onNext={
                navContext
                  ? () => {
                      setSelectedPlaceId(navContext.next.placeId);
                      setSelectedDay(navContext.next.day);
                    }
                  : undefined
              }
              prevLabel={navContext ? formatNavLabel(navContext.prev) : undefined}
              nextLabel={navContext ? formatNavLabel(navContext.next) : undefined}
            />
          </div>
        )}
      </div>

      {/* Itinerary drawer */}
      <div
        className="
          fixed bottom-0 left-0 right-0
          md:relative md:flex-shrink-0
          transition-transform duration-300
        "
        style={{
          height: '60vh',
          width: '100%',
          background: 'var(--cream)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: '0 -4px 16px rgba(26, 26, 26, 0.10)',
          transform: showItinerary ? 'translateY(0)' : 'translateY(100%)',
          zIndex: 40,
        }}
      >
        <div
          className="md:hidden flex justify-center"
          onClick={() => setShowItinerary(false)}
          style={{ cursor: 'pointer', paddingTop: '8px', paddingBottom: '4px' }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              background: 'var(--ink-faint)',
              borderRadius: '2px',
            }}
          />
        </div>
        <Itinerary
          trip={trip}
          places={places}
          selectedDay={selectedDay}
          onSelectDay={(d) => {
            setSelectedDay(d);
            setSelectedPlaceId(null);
          }}
          onSelectPlace={(id) => {
            setSelectedPlaceId(id);
            setShowItinerary(false);
          }}
        />
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          main > div:last-child {
            position: relative !important;
            transform: none !important;
            height: 100% !important;
            width: 420px !important;
            border-radius: 0 !important;
            border-left: 0.5px solid var(--hair-mid);
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}
