import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { gradient } from '../data/theme'
import { LEVEL } from './levels'

const COLS = 26
const ROWS = 11
const GAP = 0.58
const COUNT = COLS * ROWS

const dummy = new THREE.Object3D()

function rampColour(t: number, target: THREE.Color) {
  const scaled = t * (gradient.length - 1)
  const i = Math.min(gradient.length - 2, Math.floor(scaled))
  const a = new THREE.Color(gradient[i])
  const b = new THREE.Color(gradient[i + 1])
  return target.copy(a).lerp(b, scaled - i)
}

/** Final level: a rippling field of cubes — the 3D cousin of the README band. */
export function CubeWave() {
  const ref = React.useRef<THREE.InstancedMesh>(null)

  React.useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const colour = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS
      rampColour(col / (COLS - 1), colour)
      mesh.setColorAt(i, colour)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS
      const row = (i / COLS) | 0
      const x = (col - (COLS - 1) / 2) * GAP
      const z = (row - (ROWS - 1) / 2) * GAP
      const d = Math.sqrt(x * x + z * z)
      const h = 0.35 + (Math.sin(d * 1.1 - t * 1.7) * 0.5 + 0.5) * 1.5
      dummy.position.set(x, LEVEL.signal - 1.6 + h / 2, z)
      dummy.scale.set(0.42, h, 0.42)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.28} metalness={0.7} toneMapped={false} />
      </instancedMesh>
      <pointLight position={[0, LEVEL.signal + 3, 3]} intensity={30} distance={22} color="#8338EC" />
    </group>
  )
}
