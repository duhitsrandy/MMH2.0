# Meet-Me-Halfway

A web application that helps users find equitable meeting points between two locations, with balanced travel times for both parties and nearby points of interest.

## Overview

Meet-Me-Halfway calculates the optimal midpoint between two locations where both parties have approximately equal travel times. The app then displays nearby points of interest (POIs) such as restaurants, cafes, and parks around this midpoint, making it easy to find convenient meeting places.

## Features

- **Balanced Midpoint Calculation**: Finds meeting points with equitable travel times for both parties
- **Points of Interest**: Displays nearby restaurants, cafes, and other venues around the midpoint
- **Travel Time Information**: Shows estimated drive times from each starting location to each POI
- **Interactive Map**: Visualizes routes, midpoints, and POIs on an interactive map
- **Recent Searches**: Saves recent location pairs for quick access
- **Saved Locations**: Save frequently used locations for quick access

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI, Leaflet for maps
- **Backend**: Server Actions, Supabase (PostgreSQL), Drizzle ORM
- **Authentication**: Clerk
- **APIs**: LocationIQ for geocoding, routing, and POI search

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account
- Clerk account
- LocationIQ API key

### Environment Setup

Create a `.env.local` file with the following variables:

```
# DB
DATABASE_URL=your_supabase_connection_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Meet-Me-Halfway Specific
NEXT_PUBLIC_LOCATIONIQ_KEY=your_locationiq_api_key
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

# MMH
