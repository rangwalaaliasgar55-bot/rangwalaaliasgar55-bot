import * as React from 'react'
import { theme } from '../../src/data/theme'
import { icons, type IconSlug } from '../../src/data/icons'
import { BrandIcon, VText, widthOf } from '../lib/ui'

/** Self-hosted, animated replacements for shields.io badges. */

type ButtonProps = {
  label: string
  accent: string
  icon?: IconSlug
  glyph?: 'play' | 'cube'
  primary?: boolean
  height?: number
  fontSize?: number
}

function Button({ label, accent, icon, glyph, primary = false, height = 48, fontSize = 13 }: ButtonProps) {
  const tracking = primary ? 3.4 : 2.8
  const padX = primary ? 26 : 20
  const iconSize = primary ? 18 : 17
  const gap = 12
  const textW = widthOf(label, { size: fontSize, weight: 'bold', tracking })
  const hasMark = Boolean(icon || glyph)
  const w = Math.round(padX * 2 + (hasMark ? iconSize + gap : 0) + textW)
  const h = height
  const pad = 4 // room for the glow
  const W = w + pad * 2
  const H = h + pad * 2
  const r = h / 2

  const markX = pad + padX + iconSize / 2
  const textX = pad + padX + (hasMark ? iconSize + gap : 0)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label={label}>
      <title>{label}</title>
      <defs>
        <linearGradient id="border" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.magenta} />
          <stop offset="35%" stopColor={theme.violet} />
          <stop offset="70%" stopColor={theme.cyan} />
          <stop offset="100%" stopColor={theme.mint} />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-1 0;1 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <linearGradient id="fill" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#111938" />
          <stop offset="100%" stopColor="#080c1c" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;1 0" keyTimes="0;0.6;1" dur="3.6s" repeatCount="indefinite" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* pulsing halo */}
      <rect x={pad} y={pad} width={w} height={h} rx={r} fill={primary ? 'url(#border)' : accent} opacity={0.35} filter="url(#glow)">
        <animate attributeName="opacity" values={primary ? '0.3;0.7;0.3' : '0.14;0.36;0.14'} dur="3s" repeatCount="indefinite" />
      </rect>

      <rect x={pad} y={pad} width={w} height={h} rx={r} fill="url(#fill)" />
      <rect
        x={pad + 0.9}
        y={pad + 0.9}
        width={w - 1.8}
        height={h - 1.8}
        rx={r - 0.9}
        fill="none"
        stroke={primary ? 'url(#border)' : accent}
        strokeWidth={primary ? 2 : 1.4}
        strokeOpacity={primary ? 1 : 0.7}
      />
      <rect x={pad} y={pad} width={w} height={h} rx={r} fill="url(#sheen)" />

      {glyph === 'play' && (
        <g transform={`translate(${markX} ${H / 2})`}>
          <circle r={10.5} fill={accent} fillOpacity={0.16} />
          <path d="M-3.4 -5.6L6 0L-3.4 5.6Z" fill={accent}>
            <animateTransform attributeName="transform" type="translate" values="0 0;2.5 0;0 0" dur="1.8s" repeatCount="indefinite" />
          </path>
        </g>
      )}
      {glyph === 'cube' && (
        <g transform={`translate(${markX} ${H / 2})`}>
          <path d="M0 -9L8 -4.5L8 4.5L0 9L-8 4.5L-8 -4.5Z" fill="none" stroke={accent} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M0 -9L0 0L8 4.5M0 0L-8 4.5" fill="none" stroke={accent} strokeWidth={1.2} strokeOpacity={0.75}>
            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
          </path>
        </g>
      )}
      {icon && (
        <g transform={`translate(${markX} ${H / 2})`}>
          <BrandIcon slug={icon} size={iconSize} fill={icons[icon].hex === '#000000' ? theme.text : undefined} />
        </g>
      )}

      <VText size={fontSize} weight="bold" tracking={tracking} x={textX} y={H / 2 + fontSize * 0.36} fill={theme.text}>
        {label}
      </VText>
    </svg>
  )
}

export function Buttons(): Array<[string, React.ReactElement]> {
  return [
    ['btn-live.svg', <Button label="LAUNCH 3D EXPERIENCE" accent={theme.cyan} glyph="play" primary height={58} fontSize={15} />],
    ['btn-github.svg', <Button label="GITHUB" accent={theme.text} icon="github" />],
    ['btn-skyline.svg', <Button label="3D SKYLINE" accent={theme.magenta} glyph="cube" />],
    ['btn-stack.svg', <Button label="THE STACK" accent={theme.mint} icon="three" />],
    ['btn-source.svg', <Button label="HOW THIS IS BUILT" accent={theme.violet} icon="react" />],
  ]
}
