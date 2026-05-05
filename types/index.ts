export interface Place {
  id: string;
  name: string;
  type: string;
  category?: string;
  coordinates?: [number, number]; // [lng, lat]
  address?: string;
  region?: string;
  subRegion?: string;
  nearestTown?: string;
  country?: string;
  proposedBy?: string;
  status?: string;
  tags?: string[];
  vibe?: string;
  phone?: string;
  website?: string;
  booking?: string;
  practical?: Record<string, any>;
  recommendations?: Array<{
    source: string;
    date: string;
    context?: string;
    note?: string;
  }>;
  narrative?: string;
  lastEdited?: string;
  googlePlaceId?: string;
}

export interface PlacesData {
  generatedAt: string;
  count: number;
  places: Place[];
}

export interface TripStop {
  placeId: string;
  type: string; // 'anchor' | 'lunch' | 'morning' | 'afternoon' | 'optional' | 'settle' | 'transit' | etc.
  time: string;
  duration: number; // minutes
  notes?: string;
}

export interface TripDay {
  day: number;
  date: string;
  weekday: string;
  title: string;
  summary: string;
  stops: TripStop[];
}

export interface TripBase {
  nights: number[];
  region: string;
  where: string;
  lodging: string;
  lodgingStatus: 'LOCKED' | 'WA' | 'BOOKED' | 'TBD';
  lodgingOptions: string[];
}

export interface OpenDecision {
  id: string;
  question: string;
  options: string[];
  urgency: 'high' | 'medium' | 'low';
  deadline: string;
}

export interface BookingItem {
  what: string;
  priority: number;
  status: string;
}

export interface TripData {
  tripId: string;
  slug?: string;
  title: string;
  subtitle: string;
  summary?: string;
  regions?: string[];
  status?: 'planning' | 'draft' | 'locked' | 'past';
  coverImage?: string | null;
  dates: {
    start: string;
    end: string;
  };
  travelers: string[];
  flow: {
    arrive: string;
    depart: string;
  };
  bases: TripBase[];
  days: TripDay[];
  openDecisions: OpenDecision[];
  bookingsToLock: BookingItem[];
}

export interface TripIndexEntry {
  slug: string;
  file?: string;
  title: string;
  summary?: string;
  subtitle?: string;
  regions?: string[];
  dates?: { start: string; end: string };
  dateRange?: string;
  nights?: number;
  bases?: number;
  status: 'planning' | 'draft' | 'locked' | 'past' | 'superseded';
  view?: 'map' | 'outline';
  outlineMarkdown?: string;
}

export interface TripIndex {
  trips: TripIndexEntry[];
}
