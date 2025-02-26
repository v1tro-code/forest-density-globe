"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { feature } from "topojson-client"
import forestData from "@/data/forest_density_v0.json"

interface D3GlobeProps {
  width?: number
  height?: number
  year: number
  onSelectCountry?: (country: any) => void
}

const D3Globe = ({ width = 800, height = 800, year, onSelectCountry }: D3GlobeProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const isMouseDown = useRef(false)
  const rotation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!svgRef.current) return

    // Limpiar SVG existente
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)

    // Configurar proyección
    const projection = d3
      .geoOrthographic()
      .scale(height * 0.5)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    // Crear grupo principal
    const g = svg.append("g")

    // Añadir cuadrícula
    const graticule = d3.geoGraticule()
    g.append("path")
      .datum(graticule())
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#232323")
      .attr("stroke-width", "0.5")

    // Cargar datos del mundo
    fetch("/data/world-topo.json")
      .then((response) => response.json())
      .then((worldData) => {
        const countries = feature(worldData, worldData.objects.countries)

        // Dibujar países
        g.selectAll("path.country")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path)
          .style("fill", (d: any) => {
            const countryData = forestData.find((f) => f.country_code === d.properties.ISO_A3)
            if (!countryData) return "#1a1a1a"

            const value = countryData[`forest_${year}`]
            return d3.interpolateRdYlBu(value / 100)
          })
          .style("stroke", "#060a0f")
          .style("stroke-width", "0.5")
          .on("mouseover", (event, d: any) => {
            const countryData = forestData.find((f) => f.country_code === d.properties.ISO_A3)

            if (countryData) {
              d3.select(event.currentTarget).style("fill", "#6ea9ff").style("stroke", "white")

              if (onSelectCountry) {
                onSelectCountry(countryData)
              }
            }
          })
          .on("mouseout", (event, d: any) => {
            const countryData = forestData.find((f) => f.country_code === d.properties.ISO_A3)

            d3.select(event.currentTarget)
              .style("fill", () => {
                if (!countryData) return "#1a1a1a"
                const value = countryData[`forest_${year}`]
                return d3.interpolateRdYlBu(value / 100)
              })
              .style("stroke", "#060a0f")
          })

        // Eventos de arrastre
        svg
          .on("mousedown", () => {
            isMouseDown.current = true
          })
          .on("mouseup", () => {
            isMouseDown.current = false
          })
          .on("mousemove", (event) => {
            if (!isMouseDown.current) return

            const { movementX, movementY } = event
            rotation.current.x += movementX / 2
            rotation.current.y += movementY / 2

            projection.rotate([rotation.current.x, rotation.current.y])

            g.selectAll("path.country").attr("d", path)
            g.select("path.graticule").attr("d", path)
          })
      })
  }, [width, height, year, onSelectCountry])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-black"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}

export default D3Globe

