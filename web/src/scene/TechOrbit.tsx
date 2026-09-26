import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { stack } from '../data/profile'
import { theme } from '../data/theme'
import { iconTexture } from '../lib/icon-texture'
import { LEVEL } from './levels'

const RINGS = [
  { radius: 2.1, tilt: 0.34, speed: 0.34 },
  { radius: 3.4, tilt: -0.22, speed: -0.24 },
  { radius: 4.7, tilt: 0.16, speed: 0.17 },
]

function Ring({ index }: { index: number }) {
  const ref = React.useRef<THREE.Group>(null)
  const ring = RINGS[index]
  const items = stack.filter((s) => s.ring === index)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * ring.speed
  })

  return (
    <group rotation={[ring.tilt, 0, ring.tilt * 0.6]}>
      {/* the orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ring.radius, 0.008, 6, 160]} />
        <meshBasicMaterial color={index % 2 ? theme.magenta : theme.cyan} transparent opacity={0.4} toneMapped={false} />
      </mesh>

      <group ref={ref}>
        {items.map((item, i) => {
          const angle = (i / items.length) * Math.PI * 2
          return (
            <IconSprite
              key={item.slug}
              slug={item.slug}
              position={[Math.cos(angle) * ring.radius, 0, Math.sin(angle) * ring.radius]}
            />
          )
        })}
      </group>
    </group>
  )
}

function IconSprite({ slug, position }: { slug: Parameters<typeof iconTexture>[0]; position: [number, number, number] }) {
  const ref = React.useRef<THREE.Sprite>(null)
  const texture = React.useMemo(() => iconTexture(slug), [slug])
  const seed = React.useMemo(() => Math.random() * 10, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const s = 0.85 + Math.sin(t * 1.5 + seed) * 0.05
    ref.current.scale.setScalar(s)
    ref.current.position.y = position[1] + Math.sin(t * 0.9 + seed) * 0.12
  })

  return (
    <sprite ref={ref} position={position}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

/** Second level: the toolkit, orbiting a small core. */
export function TechOrbit() {
  const core = React.useRef<THREE.Mesh>(null)
  const shell = React.useRef<THREE.LineSegments>(null)
  const edges = React.useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.95, 0), 1), [])

  useFrame((state, delta) => {
    if (shell.current) {
      shell.current.rotation.y += delta * 0.45
      shell.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.5
    }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08)
  })

  return (
    <group position={[0, LEVEL.stack, 0]}>
      <mesh ref={core}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color={theme.mint} toneMapped={false} />
      </mesh>
      <lineSegments ref={shell} geometry={edges}>
        <lineBasicMaterial color={theme.cyan} transparent opacity={0.75} toneMapped={false} />
      </lineSegments>
      <pointLight color={theme.mint} intensity={12} distance={12} />
      {RINGS.map((_, i) => (
        <Ring key={i} index={i} />
      ))}
    </group>
  )
}
