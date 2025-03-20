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
- **Saved Locations**: Save frequently used locations for quick selection

## Technical Implementation

### Midpoint Calculation Algorithm

The app uses a sophisticated algorithm to find the optimal midpoint:

1. Calculates the total distance of the route
2. Finds the exact 50% distance point along the route
3. Uses linear interpolation for precise midpoint positioning
4. Ensures the midpoint is actually on the route

### API Integration

The app integrates with:

- **LocationIQ**: For geocoding and POI search
- **OSRM**: For route calculation and travel time estimation
- **Leaflet**: For interactive map visualization

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- LocationIQ API key

### Environment Setup

1. Add your LocationIQ API key to the `.env.local` file:

```
NEXT_PUBLIC_LOCATIONIQ_KEY=your_locationiq_api_key_here
```

## Database Schema

The app uses the following database tables:

- **locations**: Stores saved locations
- **searches**: Stores search history
- **pois**: Stores points of interest for each search

## Components

- **MeetMeHalfwayForm**: Main form for entering start and end locations
- **ResultsMap**: Displays the map with start, end, and midpoint locations
- **PointsOfInterest**: Displays nearby points of interest
- **SavedLocations**: Displays and manages saved locations
- **RecentSearches**: Displays recent searches

## License

[MIT License](LICENSE) 