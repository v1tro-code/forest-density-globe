"use client"

import { useEffect, useState } from "react"
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid"
import forestData from "@/data/forest_density_v0.json"

const InfoPanel = ({ country, year }) => {
  const [countryData, setCountryData] = useState(null)

  useEffect(() => {
    if (country) {
      const data = forestData.find((c) => c.country_code === country)
      setCountryData(data)
    } else {
      setCountryData(null)
    }
  }, [country])

  if (!countryData) return null

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-400"
    if (trend < 0) return "text-red-400"
    return "text-gray-400"
  }

  const getForestColor = (percentage) => {
    if (percentage >= 80) return "from-red-600 to-red-500"
    if (percentage >= 60) return "from-yellow-400 to-yellow-300"
    if (percentage >= 40) return "from-green-500 to-green-400"
    if (percentage >= 20) return "from-cyan-500 to-cyan-400"
    return "from-blue-600 to-blue-500"
  }

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-75 p-4 rounded-lg backdrop-blur-sm max-w-sm">
      <h3 className="text-xl font-bold mb-3">{countryData.country_name}</h3>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Forest Coverage {year}</div>
          <div
            className={`h-4 rounded bg-gradient-to-r ${getForestColor(countryData[`forest_${year}`])}`}
            style={{ width: `${countryData[`forest_${year}`]}%` }}
          ></div>
          <div className="text-right text-sm mt-1">{countryData[`forest_${year}`]}%</div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-400">Change (2000-2020):</div>
          <div className={`flex items-center ${getTrendColor(countryData.forest_trend)}`}>
            {countryData.forest_trend > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : countryData.forest_trend < 0 ? (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            ) : null}
            <span>{countryData.forest_trend.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel

