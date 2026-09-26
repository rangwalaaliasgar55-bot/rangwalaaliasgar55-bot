/** Shared SVG building blocks for the generated README artwork. */
import * as React from 'react'
import { text, measureText, type TextOptions } from './font'
import { theme } from '../../src/data/theme'
import { icons, type IconSlug } from '../../src/data/icons'

/* ------------------------------------------------------------------ text - */

export function VText({
  children,
  fill = theme.text,
  opacity,
  filter,
  ...opts
}: TextOptions & {
  children: string
  fill?: string
  opacity?: number
  filter?: string
}) {
  const t = text(children, opts)
  return <path d={t.d} fill={fill} fillRule="evenodd" opacity={opacity} filter={filter} />
}

export const widthOf = measureText

/* ---------------------------------------------------------------- shapes - */

export function ellipsePath(cx: number, cy: number, rx: number, ry: number, rot = 0) {
  const k = 0.5522847498
  const pts: [number, number][] = [
    [rx, 0],
    [rx, ry * k],
    [rx * k, ry],
    [0, ry],
    [-rx * k, ry],
    [-rx, ry * k],
    [-rx, 0],
    [-rx, -ry * k],
    [-rx * k, -ry],
    [0, -ry],
    [rx * k, -ry],
    [rx, -ry * k],
  ]
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  const m = pts.map(([x, y]) => {
    const px = cx + x * cos - y * sin
    const py = cy + x * sin + y * cos
    return `${Math.round(px * 10) / 10} ${Math.round(py * 10) / 10}`
  })
  return `M${m[0]}C${m[1]} ${m[2]} ${m[3]}C${m[4]} ${m[5]} ${m[6]}C${m[7]} ${m[8]} ${m[9]}C${m[10]} ${m[11]} ${m[0]}Z`
}

/* ------------------------------------------------------------------ defs - */

export function Glow({ id, blur = 4 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-70%" y="-70%" width="240%" height="240%">
      <feGaussianBlur stdDeviation={blur} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

export function SoftGlow({ id, blur = 10 }: { id: string; blur?: number }) {
  return (
    <filter id={id} x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation={blur} />
    </filter>
  )
}

export function BrandGradient({ id, x1 = '0%', x2 = '100%' }: { id: string; x1?: string; x2?: string }) {
  return (
    <linearGradient id={id} x1={x1} y1="0%" x2={x2} y2="0%">
      <stop offset="0%" stopColor={theme.magenta} />
      <stop offset="33%" stopColor={theme.violet} />
      <stop offset="66%" stopColor={theme.blue} />
      <stop offset="100%" stopColor={theme.mint} />
    </linearGradient>
  )
}

/* ----------------------------------------------------------------- atoms - */

/** Deterministic pseudo random so rebuilds produce identical files. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function Stars({
  count,
  width,
  height,
  seed = 7,
  maxR = 1.5,
}: {
  count: number
  width: number
  height: number
  seed?: number
  maxR?: number
}) {
  const rand = rng(seed)
  const colours = [theme.cyan, theme.violet, '#ffffff', theme.mint]
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = Math.round(rand() * width)
        const y = Math.round(rand() * height)
        const rr = Math.round((0.5 + rand() * maxR) * 10) / 10
        const dur = Math.round((2 + rand() * 4) * 10) / 10
        const delay = Math.round(rand() * dur * 10) / 10
        const c = colours[Math.floor(rand() * colours.length)]
        return (
          <circle key={i} cx={x} cy={y} r={rr} fill={c} opacity={0.25}>
            <animate
              attributeName="opacity"
              values="0.05;0.7;0.05"
              dur={`${dur}s`}
              begin={`-${delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        )
      })}
    </g>
  )
}

/** Small brand-coloured logo mark, centred on (0,0), sized to `size` px. */
export function BrandIcon({ slug, size, fill }: { slug: IconSlug; size: number; fill?: string }) {
  const icon = icons[slug]
  const s = size / 24
  return (
    <g transform={`scale(${Math.round(s * 1000) / 1000}) translate(-12 -12)`}>
      <path d={icon.path} fill={fill ?? icon.hex} />
    </g>
  )
}

/** Rounded "pill" with vector text inside — used for tech tags. */
export function Chip({
  label,
  x,
  y,
  colour = theme.muted,
  size = 10,
}: {
  label: string
  x: number
  y: number
  colour?: string
  size?: number
}) {
  const padding = 9
  const w = widthOf(label, { size, weight: 'semi_bold', tracking: 0.6 }) + padding * 2
  const h = size + 12
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={Math.round(w)} height={h} rx={h / 2} fill={colour} fillOpacity={0.1} stroke={colour} strokeOpacity={0.35} />
      <VText size={size} weight="semi_bold" tracking={0.6} x={padding} y={h / 2 + size * 0.36} fill={colour}>
        {label}
      </VText>
    </g>
  )
}

export const chipWidth = (label: string, size = 10) =>
  widthOf(label, { size, weight: 'semi_bold', tracking: 0.6 }) + 18

/** Animated corner brackets — cheap sci-fi HUD flavour. */
export function Brackets({
  x,
  y,
  w,
  h,
  len = 22,
  colour = theme.cyan,
  opacity = 0.55,
}: {
  x: number
  y: number
  w: number
  h: number
  len?: number
  colour?: string
  opacity?: number
}) {
  const d = [
    `M${x} ${y + len}L${x} ${y}L${x + len} ${y}`,
    `M${x + w - len} ${y}L${x + w} ${y}L${x + w} ${y + len}`,
    `M${x + w} ${y + h - len}L${x + w} ${y + h}L${x + w - len} ${y + h}`,
    `M${x + len} ${y + h}L${x} ${y + h}L${x} ${y + h - len}`,
  ].join('')
  return (
    <path d={d} fill="none" stroke={colour} strokeWidth={1.4} strokeOpacity={opacity} strokeLinecap="round">
      <animate
        attributeName="stroke-opacity"
        values={`${opacity};${opacity * 0.35};${opacity}`}
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
  )
}
