export const processForestData = (rawData: any[]) => {
  return rawData.map((country) => ({
    ...country,
    forest_trend: Number(country.forest_trend.toFixed(1)),
    forest_2000: Number(country.forest_2000.toFixed(1)),
    forest_2020: Number(country.forest_2020.toFixed(1)),
  }))
}

export const findCountryData = (countryCode: string, forestData: any[]) => {
  return forestData.find((d) => d.country_code === countryCode)
}

