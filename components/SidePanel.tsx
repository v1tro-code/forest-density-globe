"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import forestData from "@/data/forest_density_v0.json"

interface SidePanelProps {
  onFilterChange: (filters: any) => void
}

const SidePanel: React.FC<SidePanelProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [region, setRegion] = useState("")
  const [densityRange, setDensityRange] = useState([0, 100])

  const regions = Array.from(new Set(forestData.map((country) => country.region)))

  useEffect(() => {
    onFilterChange({ searchTerm, region, densityRange })
  }, [searchTerm, region, densityRange, onFilterChange])

  return (
    <Card className="w-80 bg-black/50 backdrop-blur-sm border-white/10 text-white">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Country</Label>
          <Input
            id="search"
            placeholder="Enter country name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Select onValueChange={setRegion}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Forest Density Range</Label>
          <Slider min={0} max={100} step={1} value={densityRange} onValueChange={setDensityRange} className="my-4" />
          <div className="flex justify-between text-sm">
            <span>{densityRange[0]}%</span>
            <span>{densityRange[1]}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SidePanel

