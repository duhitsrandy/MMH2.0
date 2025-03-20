export interface PoiResponse {
  osm_id?: string
  name: string
  type: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}
