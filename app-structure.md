# Meet-Me-Halfway App Structure Documentation

## Overview
Meet-Me-Halfway is a web application that calculates optimal meeting points between two locations, ensuring balanced travel times for all parties. The app provides nearby points of interest and integrates mapping features for a seamless user experience.

## Tech Stack Breakdown

### Frontend
- **Next.js 14+**: App Router, Server Components
- **React**: For UI components and state management
- **Tailwind CSS**: For styling
- **Shadcn UI**: Component library built on Radix UI
- **Framer Motion**: For animations
- **Leaflet**: For interactive maps

### Backend
- **Supabase**: PostgreSQL database
- **Drizzle ORM**: Type-safe database operations
- **Server Actions**: Next.js server-side operations
- **LocationIQ API**: Geocoding, routing, and POI search

### Authentication
- **Clerk**: User authentication and management

### Analytics
- **PostHog**: User behavior tracking

### Development Tools
- **TypeScript**: Type safety
- **ESLint & Prettier**: Code formatting
- **Husky**: Git hooks

## Core Features & Implementation

### 1. Location Search & Midpoint Calculation

#### Search Form Component
```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
  radius: z.number().min(100).max(5000).default(1000)
});

export function SearchForm({ onSearch }: { onSearch: (data: SearchFormData) => Promise<void> }) {
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      radius: 1000
    }
  });

  const handleSubmit = async (data: z.infer<typeof searchSchema>) => {
    try {
      await onSearch(data);
    } catch (error) {
      form.setError("root", {
        message: "Failed to process search"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="startLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter start location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Similar field for endLocation */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Searching..." : "Find Midpoint"}
        </Button>
      </form>
    </Form>
  );
}
```

#### Midpoint Calculation Logic
```typescript
"use server";

import { calculateDistance, calculateBearing } from "@/lib/utils";

interface Point {
  lat: number;
  lng: number;
}

export async function calculateMidpoint(start: Point, end: Point): Promise<MidpointResult> {
  // Convert to radians
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lng);
  const lat2 = toRadians(end.lat);
  const lon2 = toRadians(end.lng);

  // Calculate midpoint
  const Bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
  const By = Math.cos(lat2) * Math.sin(lon2 - lon1);
  const midLat = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
  );
  const midLng = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

  // Get travel times using LocationIQ
  const [timeA, timeB] = await Promise.all([
    getTravelTime(start, { lat: toDegrees(midLat), lng: toDegrees(midLng) }),
    getTravelTime(end, { lat: toDegrees(midLat), lng: toDegrees(midLng) })
  ]);

  return {
    midpoint: {
      lat: toDegrees(midLat),
      lng: toDegrees(midLng)
    },
    travelTimeA: timeA,
    travelTimeB: timeB
  };
}

async function getTravelTime(from: Point, to: Point): Promise<number> {
  const response = await fetch(
    `https://us1.locationiq.com/v1/directions/driving/${from.lng},${from.lat};${to.lng},${to.lat}?key=${process.env.LOCATIONIQ_API_KEY}&overview=false`
  );
  const data = await response.json();
  return data.routes[0].duration;
}
```

### 2. Map Implementation

#### Map Component with Leaflet
```typescript
"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { useState, useEffect } from "react";

// Custom marker icons
const startIcon = new Icon({
  iconUrl: "/markers/start.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Similar definitions for endIcon and poiIcon

export function Map({ center, markers, routes }: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map && center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [map, center]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-[600px] w-full rounded-lg"
      whenCreated={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={[marker.position.lat, marker.position.lng]}
          icon={getMarkerIcon(marker.type)}
        >
          {marker.info && <Popup>{marker.info}</Popup>}
        </Marker>
      ))}

      {routes?.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.points.map(p => [p.lat, p.lng])}
          color={route.color}
          weight={3}
          opacity={0.7}
        />
      ))}
    </MapContainer>
  );
}
```

### 3. Points of Interest Implementation

#### POI Search and Display
```typescript
"use server";

export async function searchPOIs(
  location: Coordinates,
  radius: number,
  categories: string[] = ["restaurant", "cafe", "park"]
): Promise<POI[]> {
  const params = new URLSearchParams({
    key: process.env.LOCATIONIQ_API_KEY!,
    lat: location.lat.toString(),
    lon: location.lng.toString(),
    radius: radius.toString(),
    tag: categories.join(","),
    format: "json"
  });

  const response = await fetch(
    `https://us1.locationiq.com/v1/nearby.php?${params}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch POIs");
  }

  const data = await response.json();
  
  return data.map((poi: any) => ({
    id: poi.place_id,
    name: poi.name || "Unnamed Location",
    type: poi.type,
    coordinates: {
      lat: parseFloat(poi.lat),
      lng: parseFloat(poi.lon)
    },
    address: poi.display_name,
    rating: poi.rating,
    distance: poi.distance
  }));
}

// POI Display Component
export function POIList({ pois, onSelect }: { pois: POI[]; onSelect: (poi: POI) => void }) {
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [filter, setFilter] = useState<string>("");

  const filteredAndSortedPOIs = useMemo(() => {
    return pois
      .filter(poi => 
        poi.name.toLowerCase().includes(filter.toLowerCase()) ||
        poi.type.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "distance") {
          return a.distance - b.distance;
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [pois, sortBy, filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Filter POIs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select value={sortBy} onValueChange={(value: "distance" | "rating") => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedPOIs.map(poi => (
          <Card key={poi.id} className="cursor-pointer" onClick={() => onSelect(poi)}>
            <CardHeader>
              <CardTitle>{poi.name}</CardTitle>
              <CardDescription>{poi.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{poi.address}</p>
              <p>Distance: {(poi.distance / 1000).toFixed(2)}km</p>
              {poi.rating && <p>Rating: {poi.rating}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 4. State Management and Data Flow

#### Custom Hooks
```typescript
// hooks/use-search-state.ts
import { create } from "zustand";

interface SearchState {
  startLocation: Coordinates | null;
  endLocation: Coordinates | null;
  midpoint: Coordinates | null;
  selectedPOI: POI | null;
  setLocations: (start: Coordinates, end: Coordinates) => void;
  setMidpoint: (point: Coordinates) => void;
  setSelectedPOI: (poi: POI | null) => void;
  reset: () => void;
}

export const useSearchState = create<SearchState>((set) => ({
  startLocation: null,
  endLocation: null,
  midpoint: null,
  selectedPOI: null,
  setLocations: (start, end) => set({ startLocation: start, endLocation: end }),
  setMidpoint: (point) => set({ midpoint: point }),
  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  reset: () => set({ startLocation: null, endLocation: null, midpoint: null, selectedPOI: null })
}));

// hooks/use-search-history.ts
export function useSearchHistory(userId: string) {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSearches() {
      try {
        const response = await fetch(`/api/searches?userId=${userId}`);
        const data = await response.json();
        setSearches(data);
      } catch (error) {
        console.error("Failed to load searches:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSearches();
  }, [userId]);

  return { searches, loading };
}
```

## Directory Structure

```
├── actions/
│   ├── db/
│   │   └── searches-actions.ts
│   └── location-actions.ts
├── app/
│   ├── api/
│   ├── meet-me-halfway/
│   │   ├── results/
│   │   └── saved-searches/
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── map/
│   └── search/
├── db/
│   ├── schema/
│   └── db.ts
├── lib/
│   ├── hooks/
│   └── utils.ts
└── types/
```

## Key Implementation Details

### 1. Authentication Flow
- Clerk handles user authentication
- Protected routes using middleware
- User session management

### 2. Database Operations
```typescript
// Example server action for saving a search
export async function saveSearchAction(
  startLocation: string,
  endLocation: string,
  midpoint: Coordinates
): Promise<ActionState<Search>> {
  try {
    const [search] = await db
      .insert(searchesTable)
      .values({
        userId: auth().userId,
        startLocation,
        endLocation,
        midpoint
      })
      .returning();
    
    return {
      isSuccess: true,
      message: "Search saved successfully",
      data: search
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: "Failed to save search"
    };
  }
}
```

### 3. Map Integration
```typescript
// Example map component structure
interface MapProps {
  center: Coordinates;
  markers: Array<{
    position: Coordinates;
    type: 'start' | 'end' | 'poi';
    info?: string;
  }>;
  routes?: Array<{
    points: Coordinates[];
    color: string;
  }>;
}
```

### 4. Points of Interest
```typescript
interface POI {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  address: string;
  rating?: number;
  distance: number;
}

// Example POI fetch function
async function fetchNearbyPOIs(
  location: Coordinates,
  radius: number
): Promise<POI[]> {
  // LocationIQ API call implementation
}
```

## Environment Variables
```env
# Required environment variables
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_LOCATIONIQ_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
```

## Deployment Considerations

### Database Setup
1. Create Supabase project
2. Run migrations
3. Set up RLS policies

### API Keys
1. LocationIQ API key with required permissions
2. Clerk configuration
3. Supabase connection details

### Performance Optimization
1. Image optimization
2. API route caching
3. Static page generation where possible

## Error Handling

```typescript
// Example error handling structure
interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

function handleApiError(error: unknown): ErrorResponse {
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred'
  };
}
```

## Testing Considerations

1. Unit tests for utility functions
2. Integration tests for API routes
3. E2E tests for critical user flows

## Security Measures

1. Input validation
2. Rate limiting
3. API key protection
4. SQL injection prevention through Drizzle ORM
5. XSS prevention
6. CORS configuration

This documentation serves as a comprehensive guide for rebuilding the Meet-Me-Halfway application. It includes core functionality, database structure, API integrations, and important implementation details. 

## Additional Implementation Details

### 1. Route Protection
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login", "/signup"],
  ignoredRoutes: ["/api/webhooks(.*)"]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
};
```

### 2. API Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"),
  analytics: true
});

// Usage in API routes
export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await rateLimiter.limit(identifier);
  
  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${reset - Date.now()}ms`);
  }
  
  return { remaining, reset };
}
```

### 3. Error Boundaries
```typescript
"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### 4. Caching Strategy
```typescript
// lib/cache.ts
export const CACHE_KEYS = {
  RECENT_SEARCHES: (userId: string) => `recent-searches:${userId}`,
  POI_RESULTS: (location: string, radius: number) => 
    `poi:${location}:${radius}`,
  GEOCODING: (address: string) => `geocoding:${address}`
} as const;

export const CACHE_TTL = {
  RECENT_SEARCHES: 60 * 60 * 24, // 24 hours
  POI_RESULTS: 60 * 60, // 1 hour
  GEOCODING: 60 * 60 * 24 * 7 // 1 week
} as const;
```

This enhanced documentation provides much more detailed implementation specifics that would be crucial for rebuilding the application. It includes:

1. Complete component implementations
2. State management patterns
3. Custom hooks
4. Error handling
5. Caching strategies
6. Rate limiting
7. Type definitions
8. API integration details

Would you like me to add any other specific implementation details or expand on any particular section? 