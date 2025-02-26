"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import * as THREE from "three"
import { TextureLoader } from "three/src/loaders/TextureLoader"
import { Line2 } from "three/examples/jsm/lines/Line2"
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial"
import forestData from "@/data/forest_density_v0.json"
import countriesGeoJson from "@/data/countries.json"

const GLOBE_RADIUS = 5

const CountryBoundaries = ({ boundaries }) => {
  const linesMaterial = useMemo(() => {
    return new LineMaterial({
      color: 0x444444,
      linewidth: 0.5,
      transparent: true,
      opacity: 0.5,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    })
  }, [])

  useEffect(() => {
    boundaries.forEach((line) => {
      const geometry = new LineGeometry()
      geometry.setPositions(line)
      const lineMesh = new Line2(geometry, linesMaterial)
      lineMesh.computeLineDistances()
      lineMesh.scale.set(1, 1, 1)
    })
  }, [boundaries, linesMaterial])

  return null
}

const convertGeoToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

const Earth = ({ year, onSelectCountry }) => {
  const earthRef = useRef()
  const [hoverCountry, setHoverCountry] = useState(null)
  const [boundaries, setBoundaries] = useState([])
  const [colorMap] = useLoader(TextureLoader, ["/assets/earthmap1k.jpg"])

  const { raycaster, camera, mouse } = useThree()

  useEffect(() => {
    // Process GeoJSON to create country boundaries
    const processedBoundaries = []

    countriesGeoJson.features.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates.forEach((ring) => {
          const points = []
          ring.forEach((coord) => {
            const point = convertGeoToVector3(coord[1], coord[0], GLOBE_RADIUS)
            points.push(point.x, point.y, point.z)
          })
          processedBoundaries.push(points)
        })
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((polygon) => {
          polygon.forEach((ring) => {
            const points = []
            ring.forEach((coord) => {
              const point = convertGeoToVector3(coord[1], coord[0], GLOBE_RADIUS)
              points.push(point.x, point.y, point.z)
            })
            processedBoundaries.push(points)
          })
        })
      }
    })

    setBoundaries(processedBoundaries)
  }, [])

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    earthRef.current.rotation.y = elapsedTime / 24

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(earthRef.current)

    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point
      const lat = (Math.asin(intersectPoint.y / GLOBE_RADIUS) * 180) / Math.PI
      const lon = (Math.atan2(intersectPoint.z, intersectPoint.x) * 180) / Math.PI

      const country = forestData.find((c) => c.lat && c.lng && Math.abs(c.lat - lat) < 5 && Math.abs(c.lng - lon) < 5)

      if (country) {
        setHoverCountry(country)
      } else {
        setHoverCountry(null)
      }
    } else {
      setHoverCountry(null)
    }
  })

  const getThermalColor = (percentage) => {
    if (percentage <= 20) return new THREE.Color(0x0000ff)
    if (percentage <= 40) return new THREE.Color(0x00ffff)
    if (percentage <= 60) return new THREE.Color(0x00ff00)
    if (percentage <= 80) return new THREE.Color(0xffff00)
    return new THREE.Color(0xff0000)
  }

  useEffect(() => {
    const geometry = earthRef.current.geometry
    const positionAttribute = geometry.getAttribute("position")
    const colors = new Float32Array(positionAttribute.count * 3)

    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3()
      vertex.fromBufferAttribute(positionAttribute, i)

      const lat = (Math.asin(vertex.y / GLOBE_RADIUS) * 180) / Math.PI
      const lon = (Math.atan2(vertex.z, vertex.x) * 180) / Math.PI

      const country = forestData.find((c) => c.lat && c.lng && Math.abs(c.lat - lat) < 5 && Math.abs(c.lng - lon) < 5)

      if (country) {
        const forestPercentage = country[`forest_${year}`]
        const height = (forestPercentage / 100) * 1.5
        vertex.multiplyScalar(1 + height)

        const color = getThermalColor(forestPercentage)
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      } else {
        colors[i * 3] = 0.1
        colors[i * 3 + 1] = 0.1
        colors[i * 3 + 2] = 0.2
      }

      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    positionAttribute.needsUpdate = true
    geometry.computeVertexNormals()
  }, [year, getThermalColor]) // Added getThermalColor to dependencies

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 128, 128]} />
        <meshStandardMaterial
          vertexColors={true}
          metalness={0.5}
          roughness={0.5}
          emissive={new THREE.Color(0x000000)}
          emissiveIntensity={0.5}
        />
      </mesh>
      <CountryBoundaries boundaries={boundaries} />
      {hoverCountry && (
        <Html position={[0, GLOBE_RADIUS + 1, 0]}>
          <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm">
            <h3 className="font-bold">{hoverCountry.country_name}</h3>
            <p className="text-sm">Forest Coverage: {hoverCountry[`forest_${year}`]}%</p>
          </div>
        </Html>
      )}
    </group>
  )
}

const Globe = ({ year, onSelectCountry }) => {
  return (
    <Canvas camera={{ position: [0, 0, 16], fov: 45 }}>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[100, 10, 50]} intensity={2} />
      <pointLight position={[-100, -10, -50]} intensity={1} />
      <Earth year={year} onSelectCountry={onSelectCountry} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} minDistance={8} maxDistance={30} />
    </Canvas>
  )
}

export default Globe

