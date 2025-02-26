interface CountryInfoProps {
  country: any
  className?: string
}

const CountryInfo = ({ country, className = "" }: CountryInfoProps) => {
  if (!country) return null

  return (
    <div className={`bg-black/50 backdrop-blur-sm p-4 rounded-lg ${className}`}>
      <h2 className="text-xl font-bold mb-2">{country.name}</h2>
      {country.formal_en && <p className="text-sm text-gray-300 mb-4">{country.formal_en}</p>}
      {country.region_un && (
        <div className="text-sm">
          <span className="text-gray-400">Region: </span>
          {country.region_un}
        </div>
      )}
    </div>
  )
}

export default CountryInfo

