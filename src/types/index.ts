// Core data types for the application

export interface CountryData {
  id: string
  iso_a3?: string // Three-letter country code for linking with map features
  name: string
  parameters: Record<string, any>
  borderIds?: string[] // Optional, may not be present in all data
  translations?: Record<string, string> // Optional translations for country names
  capital_translations?: Record<string, string> // Optional translations for capital names
  disputed?: string // Optional field for disputed territory information
}

export interface ProcessedCountryData extends CountryData {
  // Note: geometry comes from base map style, not stored here
}

export interface BorderData {
  id: string
  geomString?: string // GeoJSON geometry as string
  properties?: Record<string, any>
  geometryType?: string
  hasGeometry?: boolean
}

export interface ProcessedBorderData extends BorderData {
  geometry: GeoJSON.Geometry
  feature: GeoJSON.Feature
}

export interface ISO3Lookup {
  [iso_a3: string]: CountryData
}

export interface BorderPostData {
  id: string
  location?: any // GeoJSON Point geometry or coordinates
  is_open?: number // -1: unknown, 0: closed, 1: bilateral, 2: open, 3: restrictions apply
  properties?: Record<string, any>
}

export interface ProcessedBorderPostData extends BorderPostData {
  geometry: GeoJSON.Point
  feature: GeoJSON.Feature
}

export interface ZoneData {
  id: string
  type?: number // 0: closed, 1: guide/escort needed, 2: permit needed, 3: restrictions apply
  properties?: Record<string, any>
}

export interface MapGeoJSON {
  // Countries come from base map style, not generated
  borders: GeoJSON.FeatureCollection // Borders generated from Firestore
  borderPosts: GeoJSON.FeatureCollection // Border posts generated from Firestore
}