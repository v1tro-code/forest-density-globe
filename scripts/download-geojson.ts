import fetch from "node-fetch"
import fs from "fs/promises"
import path from "path"

const GEOJSON_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"

async function downloadGeoJSON() {
  try {
    console.log("Downloading GeoJSON data...")
    const response = await fetch(GEOJSON_URL)
    const data = await response.json()

    const outputPath = path.join(process.cwd(), "public/data/world.geojson")
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2))

    console.log("GeoJSON data downloaded successfully!")
  } catch (error) {
    console.error("Error downloading GeoJSON:", error)
  }
}

downloadGeoJSON()

