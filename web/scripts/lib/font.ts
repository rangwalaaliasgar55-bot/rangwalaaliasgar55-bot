/**
 * Tiny typeface -> SVG path compiler.
 *
 * GitHub renders README images in an isolated <img> context, so any web font we
 * reference is ignored and system fonts kick in (different metrics on every
 * machine => broken layouts). To dodge that completely we convert every string
 * into real vector outlines using the Inter typeface JSON that ships with
 * @pmndrs/assets (the same "facetype.js" format three.js FontLoader eats).
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export type Weight =
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semi_bold'
  | 'bold'
  | 'extra_bold'
  | 'black'

type Glyph = { ha: number; o?: string }
type Typeface = {
  glyphs: Record<string, Glyph>
  resolution: number
  ascender: number
  descender: number
}

const cache = new Map<Weight, Typeface>()

function load(weight: Weight): Typeface {
  const hit = cache.get(weight)
  if (hit) return hit
  const file = require.resolve(`@pmndrs/assets/fonts/inter_${weight}.json.js`)
  const src = fs.readFileSync(file, 'utf8')
  const match = src.match(/base64,([A-Za-z0-9+/=]+)/)
  if (!match) throw new Error(`Could not read typeface at ${path.basename(file)}`)
  const face = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8')) as Typeface
  cache.set(weight, face)
  return face
}

const round = (n: number) => Math.round(n * 100) / 100

export type TextOptions = {
  size: number
  weight?: Weight
  /** extra space between glyphs, in px */
  tracking?: number
  /** baseline origin */
  x?: number
  y?: number
  /** 'start' (default) | 'middle' | 'end' — horizontal alignment around x */
  anchor?: 'start' | 'middle' | 'end'
}

export type CompiledText = {
  /** SVG path data, y-down, ready to drop into <path d> with fill-rule=evenodd */
  d: string
  width: number
  /** cap height for the requested size (handy for vertical centring) */
  cap: number
}

/** Inter ships no space glyph in this format — use a sane advance instead. */
const SPACE = 0.29

function advance(face: Typeface, ch: string) {
  if (ch === ' ') return face.resolution * SPACE
  const glyph = face.glyphs[ch]
  return (glyph ?? face.glyphs['?']).ha
}

/** Advance width of a string without building the outline. */
export function measureText(text: string, opts: TextOptions): number {
  const face = load(opts.weight ?? 'bold')
  const scale = opts.size / face.resolution
  const tracking = opts.tracking ?? 0
  let w = 0
  for (const ch of text) w += advance(face, ch) * scale + tracking
  return Math.max(0, w - tracking)
}

/** Compile a string into a single SVG path (y-down coordinate space). */
export function text(str: string, opts: TextOptions): CompiledText {
  const face = load(opts.weight ?? 'bold')
  const scale = opts.size / face.resolution
  const tracking = opts.tracking ?? 0
  const width = measureText(str, opts)

  const originX = opts.x ?? 0
  const originY = opts.y ?? 0
  let cursor =
    opts.anchor === 'middle' ? originX - width / 2 : opts.anchor === 'end' ? originX - width : originX

  const out: string[] = []

  for (const ch of str) {
    if (ch === ' ') {
      cursor += face.resolution * SPACE * scale + tracking
      continue
    }
    const glyph = face.glyphs[ch] ?? face.glyphs['?']
    if (glyph.o) {
      const parts = glyph.o.split(/\s+/).filter(Boolean)
      const px = (v: string) => round(cursor + Number(v) * scale)
      // y is flipped: font space is y-up, SVG is y-down
      const py = (v: string) => round(originY - Number(v) * scale)
      let i = 0
      let open = false
      while (i < parts.length) {
        const cmd = parts[i++]
        switch (cmd) {
          case 'm': {
            if (open) out.push('Z')
            out.push(`M${px(parts[i++])} ${py(parts[i++])}`)
            open = true
            break
          }
          case 'l':
            out.push(`L${px(parts[i++])} ${py(parts[i++])}`)
            break
          case 'q': {
            // facetype order: end point first, then the control point
            const ex = px(parts[i++])
            const ey = py(parts[i++])
            const cx = px(parts[i++])
            const cy = py(parts[i++])
            out.push(`Q${cx} ${cy} ${ex} ${ey}`)
            break
          }
          case 'b': {
            const ex = px(parts[i++])
            const ey = py(parts[i++])
            const c1x = px(parts[i++])
            const c1y = py(parts[i++])
            const c2x = px(parts[i++])
            const c2y = py(parts[i++])
            out.push(`C${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`)
            break
          }
          default:
            // unknown token — skip it rather than blowing up the build
            break
        }
      }
      if (open) out.push('Z')
    }
    cursor += glyph.ha * scale + tracking
  }

  return { d: out.join(''), width, cap: opts.size * 0.72 }
}
