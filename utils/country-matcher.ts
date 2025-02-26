interface CountryData {
  country_code: string
  country_name: string
  forest_2000: number
  forest_2020: number
  forest_trend: number
  lat: number | null
  lng: number | null
  [key: string]: any
}

export function normalizeCountryCode(code: string): string {
  return code.toUpperCase().trim()
}

export function normalizeCountryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
}

export function findCountryMatch(
  countryCode: string,
  countryName: string,
  forestData: CountryData[],
): CountryData | undefined {
  // Intenta coincidir por código de país primero
  const codeMatch = forestData.find((d) => normalizeCountryCode(d.country_code) === normalizeCountryCode(countryCode))
  if (codeMatch) return codeMatch

  // Si no hay coincidencia por código, intenta por nombre normalizado
  const normalizedSearchName = normalizeCountryName(countryName)
  const nameMatch = forestData.find((d) => normalizeCountryName(d.country_name) === normalizedSearchName)
  if (nameMatch) return nameMatch

  // Si aún no hay coincidencia, busca una coincidencia parcial en el nombre
  const partialMatch = forestData.find(
    (d) =>
      normalizeCountryName(d.country_name).includes(normalizedSearchName) ||
      normalizedSearchName.includes(normalizeCountryName(d.country_name)),
  )
  if (partialMatch) return partialMatch

  console.log(`No match found for country: ${countryName} (${countryCode})`)
  return undefined
}

