"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

const GlobeViz = dynamic(() => import("@/components/GlobeViz"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center bg-black text-white">
      Loading visualization...
    </div>
  ),
})

export default function Home() {
  const [year, setYear] = useState(2000)
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 })

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth, 800)
      const height = Math.min(window.innerHeight - 80, 800)
      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const handleYearChange = (newYear: number) => {
    setYear(newYear)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold">Global Forest Density</h1>
            <p className="text-sm text-gray-400">Visualizing forest coverage worldwide</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={year === 2000 ? "default" : "outline"}
              onClick={() => handleYearChange(2000)}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
            >
              2000
            </Button>
            <Button
              variant={year === 2020 ? "default" : "outline"}
              onClick={() => handleYearChange(2020)}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
            >
              2020
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-[80px] relative flex items-center justify-center min-h-[calc(100vh-80px)]">
        <GlobeViz
          width={dimensions.width}
          height={dimensions.height}
          year={year}
          onCountrySelect={setSelectedCountry}
        />

        <Card className="fixed bottom-4 left-4 w-64 bg-black/30 backdrop-blur-md border-white/10 text-white p-4 rounded-xl">
          <h3 className="font-medium mb-2">Forest Density</h3>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-900 mr-2 rounded-sm"></div>
              <span>80-100%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-700 mr-2 rounded-sm"></div>
              <span>60-80%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 mr-2 rounded-sm"></div>
              <span>40-60%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-300 mr-2 rounded-sm"></div>
              <span>20-40%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 mr-2 rounded-sm"></div>
              <span>0-20%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-700 mr-2 rounded-sm"></div>
              <span>No data</span>
            </div>
          </div>
        </Card>

        <Card className="fixed bottom-4 right-4 w-64 bg-black/30 backdrop-blur-md border-white/10 text-white p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 mt-0.5" />
            <div>
              <h3 className="font-medium mb-2">About this visualization</h3>
              <p className="text-sm text-gray-300">
                Colors represent forest density percentage. Click on countries to see detailed information. Use the
                buttons to switch between 2000 and 2020 data. Drag to rotate, scroll to zoom.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

