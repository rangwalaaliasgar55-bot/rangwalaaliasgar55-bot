import * as React from 'react'
import { theme } from '../../src/data/theme'
import { profile } from '../../src/data/profile'
import { Glow, Stars, VText, widthOf } from '../lib/ui'

const W = 1200
const H = 190
const WAVELENGTH = 400

/** Seamless sine band: 2x canvas wide so it can slide by one wavelength. */
function wavePath(baseY: number, amp: number, phase: number) {
  const segs: string[] = []
  const halves = Math.ceil((W * 2) / (WAVELENGTH / 2))
  let x = -WAVELENGTH + phase
  segs.push(`M${x} ${baseY}`)
  for (let i = 0; i < halves; i++) {
    const dir = i % 2 === 0 ? -1 : 1
    const c1 = x + WAVELENGTH * 0.125
    const c2 = x + WAVELENGTH * 0.375
    const end = x + WAVELENGTH * 0.5
    segs.push(`C${c1} ${baseY + dir * amp * 1.32} ${c2} ${baseY + dir * amp * 1.32} ${end} ${baseY}`)
    x = end
  }
  segs.push(`L${x} ${H + 40}L${-WAVELENGTH - 40} ${H + 40}Z`)
  return segs.join('')
}

function Heart({ x, y, size = 13 }: { x: number; y: number; size?: number }) {
  const s = size / 14
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 6.4C-7 0.6 -9.2 -4.6 -5.6 -7.4C-2.9 -9.5 0 -7.6 0 -5.2C0 -7.6 2.9 -9.5 5.6 -7.4C9.2 -4.6 7 0.6 0 6.4Z"
        fill={theme.magenta}
        filter="url(#glow)"
      >
        <animateTransform attributeName="transform" type="scale" values="1;1.22;1;1.1;1" keyTimes="0;0.15;0.3;0.45;1" dur="2.4s" repeatCount="indefinite" />
      </path>
    </g>
  )
}

export function Footer() {
  const size = 13
  const tracking = 4
  const pre = 'BUILT WITH'
  const post = `FROM ${profile.location.toUpperCase()}`
  const preW = widthOf(pre, { size, weight: 'bold', tracking })
  const postW = widthOf(post, { size, weight: 'bold', tracking })
  const heartW = 38
  const totalW = preW + heartW + postW
  const startX = W / 2 - totalW / 2

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label={`Built with love from ${profile.location}`}>
      <title>{`Built from ${profile.location}`}</title>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070f" />
          <stop offset="100%" stopColor="#0a0620" />
        </linearGradient>
        <linearGradient id="w1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.magenta} stopOpacity={0.55} />
          <stop offset="50%" stopColor={theme.violet} stopOpacity={0.5} />
          <stop offset="100%" stopColor={theme.blue} stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="w2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.blue} stopOpacity={0.45} />
          <stop offset="50%" stopColor={theme.cyan} stopOpacity={0.4} />
          <stop offset="100%" stopColor={theme.mint} stopOpacity={0.45} />
        </linearGradient>
        <linearGradient id="w3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.violet} stopOpacity={0.9} />
          <stop offset="100%" stopColor={theme.magenta} stopOpacity={0.9} />
        </linearGradient>
        <Glow id="glow" blur={3} />
        <clipPath id="panel">
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#panel)">
        <rect width={W} height={H} fill="url(#bg)" />
        <Stars count={40} width={W} height={110} seed={5} maxR={1.1} />

        <g opacity={0.75}>
          <path d={wavePath(112, 16, 0)} fill="url(#w1)">
            <animateTransform attributeName="transform" type="translate" values={`0 0;${WAVELENGTH} 0`} dur="14s" repeatCount="indefinite" />
          </path>
          <path d={wavePath(132, 12, 140)} fill="url(#w2)">
            <animateTransform attributeName="transform" type="translate" values={`0 0;${-WAVELENGTH} 0`} dur="10s" repeatCount="indefinite" />
          </path>
          <path d={wavePath(154, 9, 60)} fill="url(#w3)" opacity={0.55}>
            <animateTransform attributeName="transform" type="translate" values={`0 0;${WAVELENGTH} 0`} dur="7s" repeatCount="indefinite" />
          </path>
        </g>

        {/* signature */}
        <g>
          <VText size={size} weight="bold" tracking={tracking} x={startX} y={62} fill={theme.muted}>
            {pre}
          </VText>
          <Heart x={startX + preW + heartW / 2} y={57} />
          <VText size={size} weight="bold" tracking={tracking} x={startX + preW + heartW} y={62} fill={theme.muted}>
            {post}
          </VText>
        </g>
        <VText size={11} weight="semi_bold" tracking={4.4} x={W / 2} y={88} anchor="middle" fill={theme.cyan} opacity={0.75}>
          REACT / THREE.JS / WEBGL / GLSL
        </VText>
      </g>
      <rect width={W} height={H} rx={20} fill="none" stroke={theme.line} strokeWidth={1.5} />
    </svg>
  )
}
