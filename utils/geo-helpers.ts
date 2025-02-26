import * as d3 from "d3"
import { feature } from "topojson-client"

export interface GeoFeature {
  type: string
  properties: {
    name: string
    formal_en?: string
    ISO_A3?: string
  }
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

export interface ForestData {
  country_code: string
  country_name: string
  forest_2000: number
  forest_2020: number
  forest_trend: number
  lat: number
  lng: number
}

export const processGeoData = async (topoJsonUrl: string) => {
  const response = await fetch(topoJsonUrl)
  const topology = await response.json()
  return feature(topology, topology.objects.countries)
}

export const createGeoJsonFeature = (countryData: ForestData, coordinates: number[][][]): GeoFeature => {
  return {
    type: "Feature",
    properties: {
      name: countryData.country_name,
      ISO_A3: countryData.country_code,
    },
    geometry: {
      type: "Polygon",
      coordinates: coordinates,
    },
  }
}

export const getColorScale = (value: number) => {
  return d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateRdYlBu)(value)
}

