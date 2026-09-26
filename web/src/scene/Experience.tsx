import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { theme } from '../data/theme'
import { world } from '../lib/store'
import { LEVEL, TRAVEL } from './levels'
import { Starfield } from './Starfield'
import { Crystal } from './Crystal'
import { TechOrbit } from './TechOrbit'
import { ProjectSolids } from './ProjectSolids'
import { CubeWave } from './CubeWave'

/** Flies the camera down the shaft as the page scrolls. */
function CameraRig() {
  const { camera } = useThree()
  const target = React.useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const y = -world.scroll * TRAVEL
    const px = world.pointer.x
    const py = world.pointer.y

    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 1.15, 3, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y + Math.sin(t * 0.35) * 0.18, 4, delta)
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      7.4 - Math.sin(world.scroll * Math.PI) * 1.1,
      3,
      delta,
    )
    target.set(px * 0.5, y - py * 0.6, 0)
    camera.lookAt(target)
  })

  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[5, 4, 6]} intensity={90} distance={30} color={theme.cyan} />
      <pointLight position={[-6, -1, 4]} intensity={70} distance={30} color={theme.magenta} />
      <pointLight position={[0, LEVEL.work + 4, 6]} intensity={45} distance={26} color={theme.violet} />
    </>
  )
}

export function Experience() {
  return (
    <>
      <color attach="background" args={[theme.bgDeep]} />
      <fog attach="fog" args={[theme.bgDeep, 12, 42]} />

      <CameraRig />
      <Lights />

      <Starfield />
      <Crystal />
      <TechOrbit />
      <ProjectSolids />
      <CubeWave />

      {/* retro floors */}
      <gridHelper args={[70, 70, theme.cyan, '#16204a']} position={[0, -3.6, 0]} />
      <gridHelper args={[70, 70, theme.magenta, '#16204a']} position={[0, LEVEL.signal - 1.7, 0]} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.85} luminanceThreshold={0.22} luminanceSmoothing={0.35} mipmapBlur radius={0.72} />
        <Vignette offset={0.28} darkness={0.72} eskil={false} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
    </>
  )
}
