import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './scene/Experience'
import { Overlay } from './ui/Overlay'
import { Nav } from './ui/Nav'
import { Loader } from './ui/Loader'
import { SceneBoundary, StaticBackdrop, hasWebGL } from './ui/Fallback'
import { world, SECTIONS, type SectionId } from './lib/store'

export default function App() {
  const [ready, setReady] = React.useState(false)
  const [active, setActive] = React.useState<SectionId>('home')
  const webgl = React.useMemo(hasWebGL, [])

  React.useEffect(() => {
    if (!webgl) setReady(true)
  }, [webgl])

  // scroll + pointer feed the scene without re-rendering React
  React.useEffect(() => {
    let frame = 0
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      world.scroll = Math.min(1, Math.max(0, p))
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          const index = Math.min(SECTIONS.length - 1, Math.round(world.scroll * (SECTIONS.length - 1)))
          setActive(SECTIONS[index])
        })
      }
    }
    const onPointer = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onLeave = () => {
      world.pointer.x = 0
      world.pointer.y = 0
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      <div className="canvas-layer" aria-hidden="true">
        {!webgl && <StaticBackdrop />}
        {webgl && (
          <SceneBoundary>
            <Canvas
              dpr={[1, 2]}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0, 7.4], fov: 52, near: 0.1, far: 90 }}
              onCreated={() => {
                world.ready = true
                requestAnimationFrame(() => setReady(true))
              }}
            >
              <Experience />
            </Canvas>
          </SceneBoundary>
        )}
      </div>

      <Loader done={ready} />
      <Nav active={active} />
      <Overlay />
    </>
  )
}
