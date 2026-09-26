import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { projects } from '../data/profile'
import { LEVEL } from './levels'
import { world } from '../lib/store'

const GEOMETRIES = [
  () => new THREE.TetrahedronGeometry(0.95, 0),
  () => new THREE.BoxGeometry(1.25, 1.25, 1.25),
  () => new THREE.OctahedronGeometry(1.05, 0),
  () => new THREE.IcosahedronGeometry(1, 0),
]

function Solid({ index }: { index: number }) {
  const group = React.useRef<THREE.Group>(null)
  const body = React.useRef<THREE.Mesh>(null)
  const project = projects[index]
  const geometry = React.useMemo(() => GEOMETRIES[index](), [index])
  const edges = React.useMemo(() => new THREE.EdgesGeometry(geometry, 1), [geometry])
  const x = (index - (projects.length - 1) / 2) * 3.1

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const active = world.hovered === index
    group.current.rotation.y += delta * (active ? 1.1 : 0.42)
    group.current.rotation.x = Math.sin(t * 0.5 + index) * 0.3
    group.current.position.y = LEVEL.work + Math.sin(t * 0.8 + index * 1.3) * 0.28
    const target = active ? 1.34 : 1
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 6, delta)
    group.current.scale.setScalar(s)
    if (body.current) {
      const material = body.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = THREE.MathUtils.damp(
        material.emissiveIntensity,
        active ? 2.2 : 0.7,
        5,
        delta,
      )
    }
  })

  return (
    <group ref={group} position={[x, LEVEL.work, 0]}>
      <mesh ref={body} geometry={geometry}>
        <meshStandardMaterial
          color={project.accent}
          emissive={project.accent}
          emissiveIntensity={0.7}
          transparent
          opacity={0.22}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={project.accent} toneMapped={false} transparent opacity={0.95} />
      </lineSegments>
      <pointLight color={project.accent} intensity={6} distance={6} />
    </group>
  )
}

/** Third level: one platonic solid per flagship project. */
export function ProjectSolids() {
  return (
    <group>
      {projects.map((_, i) => (
        <Solid key={i} index={i} />
      ))}
    </group>
  )
}
