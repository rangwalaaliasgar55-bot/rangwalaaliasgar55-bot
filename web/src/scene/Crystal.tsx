import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { theme } from '../data/theme'
import { LEVEL } from './levels'
import { world } from '../lib/store'

/** The hero object: a distorting crystal wrapped in a wireframe shell. */
export function Crystal() {
  const shell = React.useRef<THREE.LineSegments>(null)
  const rings = React.useRef<THREE.Group>(null)
  const core = React.useRef<THREE.Mesh>(null)

  const edges = React.useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.62, 1), 1), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (shell.current) {
      shell.current.rotation.y += delta * 0.32
      shell.current.rotation.x = Math.sin(t * 0.25) * 0.28
    }
    if (rings.current) {
      rings.current.rotation.z += delta * 0.14
      rings.current.rotation.x = 0.5 + Math.sin(t * 0.3) * 0.12
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.06
      core.current.scale.setScalar(s)
    }
  })

  return (
    <group position={[0, LEVEL.home, 0]}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
        {/* distorting body */}
        <mesh castShadow={false}>
          <icosahedronGeometry args={[1.25, 4]} />
          <MeshDistortMaterial
            color={theme.violet}
            emissive={theme.blue}
            emissiveIntensity={0.55}
            roughness={0.12}
            metalness={0.92}
            distort={0.32}
            speed={1.6}
          />
        </mesh>

        {/* glowing heart */}
        <mesh ref={core}>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshBasicMaterial color={theme.cyan} toneMapped={false} />
        </mesh>

        {/* wireframe shell */}
        <lineSegments ref={shell} geometry={edges}>
          <lineBasicMaterial color={theme.cyan} transparent opacity={0.55} toneMapped={false} />
        </lineSegments>

        {/* orbit rings */}
        <group ref={rings}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.012, 8, 128]} />
            <meshBasicMaterial color={theme.cyan} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0.6, 0.4]}>
            <torusGeometry args={[3.1, 0.01, 8, 128]} />
            <meshBasicMaterial color={theme.magenta} toneMapped={false} transparent opacity={0.65} />
          </mesh>
        </group>
      </Float>

      <Sparks />
    </group>
  )
}

/** A few bright motes drifting around the crystal. */
function Sparks() {
  const ref = React.useRef<THREE.Points>(null)
  const positions = React.useMemo(() => {
    const arr = new Float32Array(90 * 3)
    for (let i = 0; i < 90; i++) {
      const r = 2 + Math.random() * 2.4
      const a = Math.random() * Math.PI * 2
      const b = (Math.random() - 0.5) * 2.4
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = b
      arr[i * 3 + 2] = Math.sin(a) * r
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y -= delta * 0.08
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.25
    const material = ref.current.material as THREE.PointsMaterial
    material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15 + world.pointer.x * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color={theme.mint}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
