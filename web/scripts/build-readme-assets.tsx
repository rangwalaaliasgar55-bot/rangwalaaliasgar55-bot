/**
 * Renders the animated README artwork.
 *
 * Every graphic in the README is a React component rendered to a static,
 * self-hosted, animated SVG — no third-party badge services, nothing that can
 * 404 on someone else's server, and the exact same design tokens as the live
 * WebGL site.
 *
 *   npm run assets          # write ../assets/*.svg
 *   npm run assets -- --png # also rasterise previews into .preview/ for QA
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Hero } from './assets/hero'
import { Stack } from './assets/stack'
import { Projects } from './assets/projects'
import { Wave } from './assets/wave'
import { Divider } from './assets/divider'
import { Buttons } from './assets/buttons'
import { Footer } from './assets/footer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '..', '..', 'assets')
const PREVIEW = path.resolve(__dirname, '..', '.preview')

const registry: Array<[string, React.ReactElement]> = [
  ['hero.svg', <Hero />],
  ['stack.svg', <Stack />],
  ['projects.svg', <Projects />],
  ['wave.svg', <Wave />],
  ['divider.svg', <Divider />],
  ['footer.svg', <Footer />],
  ...Buttons(),
]

fs.mkdirSync(OUT, { recursive: true })

const written: Array<[string, number]> = []
for (const [name, element] of registry) {
  const markup = renderToStaticMarkup(element)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`
  fs.writeFileSync(path.join(OUT, name), svg)
  written.push([name, svg.length])
}

const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length))
console.log('\n  README artwork\n  ' + '─'.repeat(34))
for (const [name, size] of written) {
  console.log(`  ${pad(name, 22)} ${(size / 1024).toFixed(1)} KB`)
}
console.log(
  `  ${pad('total', 22)} ${(written.reduce((a, [, s]) => a + s, 0) / 1024).toFixed(1)} KB\n`,
)

if (process.argv.includes('--png')) {
  const { Resvg } = await import('@resvg/resvg-js')
  fs.mkdirSync(PREVIEW, { recursive: true })
  for (const [name] of written) {
    const svg = fs.readFileSync(path.join(OUT, name), 'utf8')
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
    fs.writeFileSync(path.join(PREVIEW, name.replace('.svg', '.png')), png)
  }
  console.log(`  previews → ${path.relative(process.cwd(), PREVIEW)}\n`)
}
