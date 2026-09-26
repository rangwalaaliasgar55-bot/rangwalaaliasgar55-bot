import * as React from 'react'
import { theme } from '../../src/data/theme'
import { Glow, VText, rng } from '../lib/ui'

/** Isometric cube field that ripples — the README's "contribution terrain". */

const W = 1200
const H = 300
const COLS = 24
const ROWS = 5
const TW = 38 // half width of the top rhombus
const TH = 7 // half height of the top rhombus

const PALETTE = [theme.magenta, theme.violet, theme.blue, theme.cyan, theme.mint]

function hexToRgb(hex: string) {
  const v = hex.replace('#', '')
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}
function shade(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex)
  return toHex(r * amount, g * amount, b * amount)
}
function rampColour(t: number) {
  const scaled = t * (PALETTE.length - 1)
  const i = Math.min(PALETTE.length - 2, Math.floor(scaled))
  return mix(PALETTE[i], PALETTE[i + 1], scaled - i)
}

function Cube({ col, row, seed }: { col: number; row: number; seed: number }) {
  const ox = W / 2 - ((COLS - 1 - (ROWS - 1)) * TW) / 2
  const oy = 70
  const x = ox + (col - row) * TW
  const y = oy + (col + row) * TH

  // baked terrain height so the field reads as 3D even in static renderers
  const noise =
    0.5 + 0.5 * Math.sin(col * 0.52 + row * 0.85) * Math.cos(col * 0.19 - row * 0.4)
  const height = Math.round(6 + noise * 46 * (0.55 + 0.45 * seed))

  const base = rampColour(col / (COLS - 1))
  const lift = 0.72 + 0.5 * (height / 52)
  const top = shade(base, Math.min(1.25, lift))
  const left = shade(base, 0.34)
  const right = shade(base, 0.58)

  const amp = 5 + seed * 9
  const phase = ((col * 0.55 + row * 0.9) % (Math.PI * 2)) / (Math.PI * 2)
  const dur = 5.5
  const begin = `-${(phase * dur).toFixed(2)}s`

  const topFace = `M0 ${-height - TH}L${TW} ${-height}L0 ${-height + TH}L${-TW} ${-height}Z`
  const leftFace = `M${-TW} ${-height}L0 ${-height + TH}L0 ${TH}L${-TW} 0Z`
  const rightFace = `M0 ${-height + TH}L${TW} ${-height}L${TW} 0L0 ${TH}Z`

  return (
    <g transform={`translate(${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10})`}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0 0;0 ${-amp};0 0`}
          keyTimes="0;0.5;1"
          dur={`${dur}s`}
          begin={begin}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
        />
        <path d={leftFace} fill={left} />
        <path d={rightFace} fill={right} />
        <path d={topFace} fill={top} />
        <path d={topFace} fill="none" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={0.7} />
      </g>
    </g>
  )
}

export function Wave() {
  const rand = rng(11)
  const cells: Array<{ col: number; row: number; seed: number }> = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) cells.push({ col, row, seed: rand() })
  }
  // painter's algorithm: far cells first
  cells.sort((a, b) => a.col + a.row - (b.col + b.row))

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label="Animated isometric contribution field">
      <title>Contribution field</title>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070f" />
          <stop offset="45%" stopColor="#0a0f22" />
          <stop offset="100%" stopColor="#05070f" />
        </linearGradient>
        <radialGradient id="pool" cx="50%" cy="55%">
          <stop offset="0%" stopColor={theme.violet} stopOpacity={0.3} />
          <stop offset="100%" stopColor={theme.violet} stopOpacity={0} />
        </radialGradient>
        <Glow id="glow" blur={3} />
        <clipPath id="panel">
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#panel)">
        <rect width={W} height={H} fill="url(#bg)" />
        <ellipse cx={W / 2} cy={170} rx={570} ry={120} fill="url(#pool)" />
        {cells.map((c) => (
          <Cube key={`${c.col}-${c.row}`} {...c} />
        ))}

        <g>
          <rect x={20} y={26} width={22} height={2.5} rx={1.25} fill={theme.cyan} />
          <VText size={12} weight="bold" tracking={5} x={54} y={32} fill={theme.muted}>
            CONTRIBUTION FIELD
          </VText>
          <VText size={11} weight="semi_bold" tracking={3.6} x={W - 20} y={32} anchor="end" fill={theme.muted} opacity={0.8}>
            ALWAYS BUILDING
          </VText>
        </g>
      </g>
      <rect width={W} height={H} rx={20} fill="none" stroke={theme.line} strokeWidth={1.5} />
    </svg>
  )
}
