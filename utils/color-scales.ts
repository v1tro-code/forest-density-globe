import * as d3 from "d3"

export const forestDensityColorScale = (value: number): string => {
  const scale = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateRdYlBu)

  return value ? scale(value) : "#111111"
}

export const trendColorScale = (value: number): string => {
  const scale = d3.scaleSequential().domain([-50, 50]).interpolator(d3.interpolateRdYlBu)

  return value ? scale(value) : "#666666"
}

