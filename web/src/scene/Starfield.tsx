import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { theme } from '../data/theme'
import { LEVEL } from './levels'

const COUNT = 1400

export function Starfield() {
  const ref = React.useRef<THREE.Points>(null)

  const [positions, colors] = React.useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const palette = [theme.cyan, theme.violet, '#ffffff', theme.mint, theme.magenta].map(
      (c) => new THREE.Color(c),
    )
    for (let i = 0; i < COUNT; i++) {
      const radius = 7 + Math.random() * 26
      const angle = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = LEVEL.signal - 8 + Math.random() * (TRAVEL_SPAN + 16)
      pos[i * 3 + 2] = Math.sin(angle) * radius
      const c = palette[(Math.random() * palette.length) | 0]
      const shade = 0.45 + Math.random() * 0.55
      col[i * 3] = c.r * shade
      col[i * 3 + 1] = c.g * shade
      col[i * 3 + 2] = c.b * shade
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.085}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  )
}

const TRAVEL_SPAN = Math.abs(LEVEL.signal) + 10
