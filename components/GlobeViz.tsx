"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { zoom } from "d3-zoom"
import forestData from "@/data/forest_density_v0.json"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface GlobeVizProps {
  width?: number
  height?: number
  year?: number
  onCountrySelect?: (country: any) => void
}

const GlobeViz = ({ width = 800, height = 800, year = 2000, onCountrySelect }: GlobeVizProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const rotationRef = useRef({ x: 0, y: 0 })
  const projectionRef = useRef<d3.GeoProjection | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const animationRef = useRef<number>()
  const rotationSpeed = useRef(0.1) // Constant rotation speed
  const isDragging = useRef(false)
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown>>()

  useEffect(() => {
    const fetchGeoData = async () => {
      const response = await fetch("https://assets.codepen.io/911796/custom.geo.json")
      const data = await response.json()
      setGeoData(data)
    }

    fetchGeoData()
  }, [])

  const getColor = useCallback((value: number | undefined) => {
    if (value === undefined) return "#1a1a1a"
    const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 100])
    return colorScale(value)
  }, [])

  const normalizeCountryName = useCallback((name: string | null | undefined) => {
    if (!name) return ""
    return name.toLowerCase().replace(/[^a-z0-9]/g, "")
  }, [])

  const zoomToCountry = useCallback(
    (d: any) => {
      if (!projectionRef.current || !svgRef.current || !zoomRef.current) return

      const centroid = d3.geoCentroid(d)
      const rotation = [-centroid[0], -centroid[1]]

      // Stop the automatic rotation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Rotate to center the selected country
      d3.select(svgRef.current)
        .transition()
        .duration(1000)
        .tween("rotate", () => {
          const r = d3.interpolate(projectionRef.current!.rotate(), rotation)
          return (t: number) => {
            projectionRef.current!.rotate(r(t))
            d3.select(svgRef.current!).selectAll("path").attr("d", d3.geoPath().projection(projectionRef.current!))
          }
        })
        .on("end", () => {
          // Apply zoom after rotation
          const bounds = d3.geoPath().projection(projectionRef.current!).bounds(d)
          const dx = bounds[1][0] - bounds[0][0]
          const dy = bounds[1][1] - bounds[0][1]
          const x = (bounds[0][0] + bounds[1][0]) / 2
          const y = (bounds[0][1] + bounds[1][1]) / 2
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)))
          const translate = [width / 2 - scale * x, height / 2 - scale * y]

          d3.select(svgRef.current!)
            .transition()
            .duration(750)
            .call(zoomRef.current.transform as any, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
        })
    },
    [width, height],
  )

  const resumeRotation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    let lastTime = performance.now()
    const animate = (time: number) => {
      if (projectionRef.current && !selectedCountry && !isDragging.current) {
        const deltaTime = time - lastTime
        rotationRef.current.x += (rotationSpeed.current * deltaTime) / 16
        projectionRef.current.rotate([rotationRef.current.x, rotationRef.current.y])

        d3.select(svgRef.current!).selectAll("path").attr("d", d3.geoPath().projection(projectionRef.current))
      }
      lastTime = time
      animationRef.current = requestAnimationFrame(animate)
    }
    animate(performance.now())
  }, [selectedCountry])

  useEffect(() => {
    if (!geoData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    projectionRef.current = d3
      .geoOrthographic()
      .scale(height * 0.45)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projectionRef.current)

    const g = svg.append("g")

    // Add water
    g.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projectionRef.current.scale())
      .attr("fill", "#001f3f")
      .attr("filter", "url(#glow)")

    // Add graticule
    const graticule = d3.geoGraticule()
    g.append("path")
      .datum(graticule())
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#132f4c")
      .attr("stroke-width", "0.5")
      .attr("opacity", 0.3)

    // Create a map for faster lookups
    const forestDataMap = new Map(forestData.map((d) => [normalizeCountryName(d.country_name), d]))

    // Combine GeoJSON with forest data
    const features = geoData.features.map((feature: any) => {
      const normalizedName = normalizeCountryName(feature.properties?.name)
      const countryData =
        (normalizedName && forestDataMap.get(normalizedName)) ||
        forestData.find((d) => d.country_code === feature.properties?.formal_en)

      return {
        ...feature,
        properties: {
          ...feature.properties,
          forestData: countryData,
        },
      }
    })

    // Draw countries
    g.selectAll("path.country")
      .data(features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", (d: any) => {
        const forestPercentage = d.properties?.forestData?.[`forest_${year}`]
        return getColor(forestPercentage)
      })
      .attr("stroke", "#000")
      .attr("stroke-width", "0.5")
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d: any) {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", "1").attr("opacity", 1)
      })
      .on("mouseout", function (d: any) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", "0.5").attr("opacity", 0.8)
      })
      .on("click", (event, d: any) => {
        if (d.properties.forestData) {
          setSelectedCountry(d.properties.forestData)
          if (onCountrySelect) {
            onCountrySelect(d.properties.forestData)
          }
          zoomToCountry(d)
        }
      })

    // Add glow effect
    const defs = svg.append("defs")
    const filter = defs.append("filter").attr("id", "glow")
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur")
    const feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Rotation and zoom
    let previousMousePosition = { x: 0, y: 0 }

    const drag = d3
      .drag()
      .on("start", (event) => {
        isDragging.current = true
        previousMousePosition = { x: event.x, y: event.y }
      })
      .on("drag", (event) => {
        if (!isDragging.current) return

        const dx = event.x - previousMousePosition.x
        const dy = event.y - previousMousePosition.y

        rotationRef.current.x += dx * 0.5
        rotationRef.current.y = Math.max(-90, Math.min(90, rotationRef.current.y - dy * 0.5))

        projectionRef.current?.rotate([rotationRef.current.x, rotationRef.current.y])

        g.selectAll("path").attr("d", path)

        previousMousePosition = { x: event.x, y: event.y }
      })
      .on("end", () => {
        isDragging.current = false
        if (!selectedCountry) {
          resumeRotation()
        }
      })

    svg.call(drag)

    // Zoom
    zoomRef.current = zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoomRef.current)

    // Iniciar rotación si no hay país seleccionado
    if (!selectedCountry) {
      resumeRotation()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    geoData,
    width,
    height,
    year,
    onCountrySelect,
    getColor,
    normalizeCountryName,
    resumeRotation,
    zoomToCountry,
    selectedCountry,
  ])

  useEffect(() => {
    if (!geoData || !svgRef.current || !projectionRef.current) return

    d3.select(svgRef.current)
      .selectAll("path.country")
      .attr("fill", (d: any) => {
        const forestPercentage = d.properties?.forestData?.[`forest_${year}`]
        return getColor(forestPercentage)
      })
  }, [year, geoData, getColor])

  const handleResetView = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform as any, d3.zoomIdentity)
        .on("end", () => {
          rotationRef.current = { x: 0, y: 0 }
          setSelectedCountry(null)
          resumeRotation()
        })
    }
  }

  const handleCloseInfo = () => {
    setSelectedCountry(null)
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform as any, d3.zoomIdentity)
        .on("end", resumeRotation)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-black"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="absolute top-4 left-4">
        <Button
          onClick={handleResetView}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
        >
          Reset View
        </Button>
      </div>
      {selectedCountry && (
        <Card className="absolute top-4 right-4 w-72 bg-black/30 backdrop-blur-md border-white/10 text-white p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">{selectedCountry.country_name}</h3>
            <Button variant="ghost" size="icon" onClick={handleCloseInfo}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-400">Forest Coverage {year}</div>
              <div className="text-2xl font-bold">{selectedCountry[`forest_${year}`]?.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Change 2000-2020</div>
              <div
                className={`text-lg font-semibold ${
                  selectedCountry.forest_trend > 0
                    ? "text-green-400"
                    : selectedCountry.forest_trend < 0
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {selectedCountry.forest_trend > 0 ? "+" : ""}
                {selectedCountry.forest_trend?.toFixed(2)}%
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default GlobeViz

