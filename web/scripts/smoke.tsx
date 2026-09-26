/**
 * Headless smoke test for the WebGL scene.
 *
 * @react-three/test-renderer builds the real three.js scene graph without a
 * GPU, so CI can prove every mesh, geometry and animation frame actually
 * mounts and ticks — no "white screen" surprises on GitHub Pages.
 *
 *   npm run smoke
 */
import * as React from 'react'
import ReactThreeTestRenderer from '@react-three/test-renderer'

// silence React's act() environment warning
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import { Starfield } from '../src/scene/Starfield'
import { Crystal } from '../src/scene/Crystal'
import { ProjectSolids } from '../src/scene/ProjectSolids'
import { CubeWave } from '../src/scene/CubeWave'
import { world } from '../src/lib/store'
import { renderToStaticMarkup } from 'react-dom/server'
import { Overlay } from '../src/ui/Overlay'
import { Nav } from '../src/ui/Nav'
import { profile, projects } from '../src/data/profile'

const cases: Array<[string, React.ReactElement]> = [
  ['Starfield', <Starfield />],
  ['Crystal', <Crystal />],
  ['ProjectSolids', <ProjectSolids />],
  ['CubeWave', <CubeWave />],
]

let failed = 0

for (const [name, element] of cases) {
  try {
    const renderer = await ReactThreeTestRenderer.create(<>{element}</>)
    const objects = renderer.scene.allChildren.length
    // run a few frames so every useFrame callback executes at least once
    await ReactThreeTestRenderer.act(async () => {
      renderer.advanceFrames(4, 1 / 60)
    })
    world.hovered = 1
    await ReactThreeTestRenderer.act(async () => {
      renderer.advanceFrames(2, 1 / 60)
    })
    world.hovered = -1
    if (objects === 0) throw new Error('scene graph is empty')
    console.log(`  ✓ ${name.padEnd(14)} ${objects} objects, 6 frames ticked`)
    await renderer.unmount()
  } catch (error) {
    failed++
    console.error(`  ✗ ${name}:`, error)
  }
}

// the DOM layer must render too — cheap guard against typos in the copy deck
try {
  const html = renderToStaticMarkup(
    <>
      <Nav active="home" />
      <Overlay />
    </>,
  )
  const expected = [profile.name, profile.location, ...projects.map((p) => p.name)]
  const missing = expected.filter((token) => !html.includes(token))
  if (missing.length) throw new Error(`overlay is missing: ${missing.join(', ')}`)
  console.log(`  ✓ ${'Overlay'.padEnd(14)} ${(html.length / 1024).toFixed(1)} KB of markup`)
} catch (error) {
  failed++
  console.error('  ✗ Overlay:', error)
}

console.log(failed === 0 ? '\n  scene OK\n' : `\n  ${failed} failure(s)\n`)
process.exit(failed === 0 ? 0 : 1)
