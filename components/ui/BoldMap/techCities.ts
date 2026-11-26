/**
 * Where the bold map's routes go: the major US tech hubs, curated by hand
 * (owner, 2026-11-25: "it should be the major cities it cycles through in
 * regards to tech", not random places).
 *
 * Lower 48 only, one city per metro, spread over the map so the lines fan out
 * and their labels don't collide (Portland, San Jose, Dallas and Pittsburgh are
 * left out for sitting beside Seattle, San Francisco, Austin and New York; San
 * Diego and Phoenix are too close to Los Angeles to read as a move).
 *
 * The order is the order the map draws them in, round and round: each line
 * goes to a different part of the country from the one before it. Coordinates
 * are each city's downtown; the miles are worked out from them (geo.ts).
 */
export type TechCity = {
  name: string
  state: string
  lat: number
  lon: number
}

export const TECH_CITIES: readonly TechCity[] = [
  { name: 'New York', state: 'NY', lat: 40.7128, lon: -74.006 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lon: -122.3321 },
  { name: 'Austin', state: 'TX', lat: 30.2672, lon: -97.7431 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lon: -71.0589 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lon: -104.9903 },
  { name: 'Miami', state: 'FL', lat: 25.7617, lon: -80.1918 },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lon: -122.4194 },
  { name: 'Washington', state: 'DC', lat: 38.9072, lon: -77.0369 },
  { name: 'Salt Lake City', state: 'UT', lat: 40.7608, lon: -111.891 },
  { name: 'Atlanta', state: 'GA', lat: 33.749, lon: -84.388 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lon: -87.6298 },
  { name: 'Raleigh', state: 'NC', lat: 35.7796, lon: -78.6382 },
]
