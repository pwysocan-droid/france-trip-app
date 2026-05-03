'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Place } from '@/types';

interface MapProps {
  places: Place[];
  highlightedPlaceIds?: string[];
  routeOrder?: string[];
  initialCenter?: [number, number];
  initialZoom?: number;
  onPlaceClick?: (place: Place) => void;
  selectedPlaceId?: string | null;
}

/**
 * Landscape-derived regional palette.
 * Each color is tied to what the region actually looks like.
 */
const REGION_COLORS: Record<string, string> = {
  riviera: '#B8553A',          // Esterel limestone, roof tiles
  var: '#7C8049',              // maquis, Coteaux Varois
  'cote-bleue': '#1B3FA0',     // calanque deep water (Klein blue)
  provence: '#7C8049',         // default to maquis green for generic provence
  luberon: '#C8893A',          // Roussillon ochre
  languedoc: '#3D6E5C',        // garrigue, Cévennes oxidized green
  'languedoc-coast': '#7896A6',// Étang de Thau, oyster shell
};

function colorForPlace(place: Place): string {
  // First try sub-region for finer control (var → olive, vaucluse → ochre)
  if (place.subRegion === 'var') return REGION_COLORS.var;
  if (place.subRegion === 'vaucluse') return REGION_COLORS.luberon;
  if (place.subRegion === 'bouches-du-rhone') {
    // Cassis area uses cote-bleue blue; default to var olive otherwise
    if (place.id === 'cassis' || place.id === 'tuba-club') return REGION_COLORS['cote-bleue'];
    return REGION_COLORS.var;
  }
  if (place.subRegion === 'alpes-maritimes') return REGION_COLORS.riviera;
  if (place.subRegion === 'gard') return REGION_COLORS.languedoc;
  if (place.subRegion === 'herault' || place.subRegion === 'aude') return REGION_COLORS['languedoc-coast'];

  // Fall back to the region field
  return REGION_COLORS[place.region || ''] || '#6F6B62';
}

export default function Map({
  places,
  highlightedPlaceIds = [],
  routeOrder,
  initialCenter,
  initialZoom,
  onPlaceClick,
  selectedPlaceId,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    const placedPlaces = places.filter((p) => p.coordinates);
    if (placedPlaces.length === 0) return;

    const bounds = placedPlaces.reduce(
      (acc, p) => {
        const [lng, lat] = p.coordinates!;
        return {
          minLng: Math.min(acc.minLng, lng),
          maxLng: Math.max(acc.maxLng, lng),
          minLat: Math.min(acc.minLat, lat),
          maxLat: Math.max(acc.maxLat, lat),
        };
      },
      { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
    );

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // 'light-v11' is restrained and works well with the cream palette
      style: 'mapbox://styles/mapbox/light-v11',
      center: initialCenter || [
        (bounds.minLng + bounds.maxLng) / 2,
        (bounds.minLat + bounds.maxLat) / 2,
      ],
      zoom: initialZoom || 7,
      bounds: initialCenter
        ? undefined
        : [
            [bounds.minLng - 0.3, bounds.minLat - 0.2],
            [bounds.maxLng + 0.3, bounds.maxLat + 0.2],
          ],
      fitBoundsOptions: { padding: 60 },
    });

    // Route line
    if (routeOrder && routeOrder.length > 1) {
      map.current.on('load', () => {
        const coords = routeOrder
          .map((id) => places.find((p) => p.id === id))
          .filter((p): p is Place => !!p && !!p.coordinates)
          .map((p) => p.coordinates!);

        if (coords.length > 1 && map.current) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          });
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#1A1A1A',
              'line-width': 1,
              'line-opacity': 0.45,
              'line-dasharray': [2.5, 3],
            },
          });
        }
      });
    }

    // Markers
    placedPlaces.forEach((place) => {
      const isHighlighted = highlightedPlaceIds.includes(place.id);
      const color = colorForPlace(place);
      const el = document.createElement('div');
      el.style.cssText = `
        width: ${isHighlighted ? '14px' : '10px'};
        height: ${isHighlighted ? '14px' : '10px'};
        border-radius: 50%;
        background-color: ${color};
        border: 1.5px solid #F8F5EF;
        box-shadow: 0 1px 2px rgba(26, 26, 26, 0.25)${isHighlighted ? `, 0 0 0 4px ${color}40` : ''};
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.25)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onPlaceClick) onPlaceClick(place);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(place.coordinates!)
        .addTo(map.current!);
      markers.current[place.id] = marker;
    });

    return () => {
      map.current?.remove();
      markers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, routeOrder?.join(','), highlightedPlaceIds.join(',')]);

  // Pan to selected place
  useEffect(() => {
    if (!map.current || !selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (place?.coordinates) {
      map.current.flyTo({
        center: place.coordinates,
        zoom: 12,
        duration: 800,
      });
    }
  }, [selectedPlaceId, places]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

export { colorForPlace, REGION_COLORS };
