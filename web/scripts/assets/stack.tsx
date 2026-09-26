import * as React from 'react'
import * as THREE from 'three'
import { stack } from '../../src/data/profile'
import { icons } from '../../src/data/icons'
import { theme } from '../../src/data/theme'
import { bakeWireframe } from '../lib/three-frames'
import { BrandIcon, Brackets, Glow, SoftGlow, Stars, VText, ellipsePath } from '../lib/ui'

const W = 1200
const H = 330
const CX = W / 2
const CY = 168

type Ring = { rx: number; ry: number; rot: number; dur: number; reverse?: boolean }

const RINGS: Ring[] = [
  { rx: 215, ry: 56, rot: -0.06, dur: 16 },
  { rx: 355, ry: 92, rot: 0.08, dur: 24, reverse: true },
  { rx: 500, ry: 128, rot: -0.04, dur: 34 },
]

const FRAMES = 36

/**
 * Keyframed orbit instead of <animateMotion>: the element keeps a real
 * transform attribute, so the icon sits in the right place even where SMIL
 * is not played, and depth scale/opacity stay perfectly in sync.
 */
function orbitFrames(ring: Ring, phase: number) {
  const pos: string[] = []
  const scale: string[] = []
  const opacity: string[] = []
  const dir = ring.reverse ? -1 : 1
  for (let f = 0; f <= FRAMES; f++) {
    const t = ((f / FRAMES) * dir + phase) * Math.PI * 2
    const ex = ring.rx * Math.cos(t)
    const ey = ring.ry * Math.sin(t)
    const x = CX + ex * Math.cos(ring.rot) - ey * Math.sin(ring.rot)
    const y = CY + ex * Math.sin(ring.rot) + ey * Math.cos(ring.rot)
    const front = Math.sin(t) // +1 = nearest the viewer
    pos.push(`${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`)
    scale.push(String(Math.round((1 + front * 0.22) * 1000) / 1000))
    opacity.push(String(Math.round((0.72 + front * 0.28) * 100) / 100))
  }
  return { pos, scale, opacity }
}

function OrbitingIcon({
  slug,
  ring,
  phase,
}: {
  slug: keyof typeof icons
  ring: Ring
  phase: number
}) {
  const { pos, scale, opacity } = orbitFrames(ring, phase)
  const dur = `${ring.dur}s`
  const icon = icons[slug]

  return (
    <g transform={`translate(${pos[0]})`} opacity={opacity[0]}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={pos.join(';')}
        dur={dur}
        repeatCount="indefinite"
        calcMode="linear"
      />
      <animate attributeName="opacity" values={opacity.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
      <g transform={`scale(${scale[0]})`}>
        <animateTransform
          attributeName="transform"
          type="scale"
          values={scale.join(';')}
          dur={dur}
          repeatCount="indefinite"
          calcMode="linear"
        />
        <circle r={21} fill={theme.panel} stroke={icon.hex} strokeWidth={1.4} strokeOpacity={0.85} />
        <circle r={21} fill={icon.hex} fillOpacity={0.12} />
        <circle r={25} fill="none" stroke={icon.hex} strokeWidth={0.8} strokeOpacity={0.3}>
          <animate attributeName="r" values="22;30;22" dur="3.5s" begin={`-${(phase * 3.5).toFixed(2)}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="3.5s" begin={`-${(phase * 3.5).toFixed(2)}s`} repeatCount="indefinite" />
        </circle>
        <BrandIcon slug={slug} size={21} />
      </g>
    </g>
  )
}

function Core() {
  const cam = { cx: CX, cy: CY, scale: 46, dist: 4.4, focal: 2.7 }
  const { edges } = bakeWireframe(new THREE.OctahedronGeometry(1, 0), {
    cam,
    frames: 20,
    tiltX: 0.4,
    spin: 1,
    wobble: 0.3,
  })
  return (
    <g>
      <circle cx={CX} cy={CY} r={86} fill="url(#coreHalo)">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx={CX} cy={CY} r={40} fill="none" stroke={theme.cyan} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="3 7">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="18s" repeatCount="indefinite" />
      </circle>
      <g filter="url(#glow)">
        {edges.map((e, i) => (
          <path key={i} d={e.frames[0]} fill="none" stroke="url(#coreEdge)" strokeWidth={1.4} strokeLinecap="round">
            <animate attributeName="d" values={e.frames.join(';')} dur="14s" repeatCount="indefinite" calcMode="linear" />
            <animate
              attributeName="stroke-opacity"
              values={e.depth.map((d) => Math.round((0.25 + d * 0.75) * 100) / 100).join(';')}
              dur="14s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </path>
        ))}
      </g>
      <circle cx={CX} cy={CY} r={7} fill="#ffffff" filter="url(#glow)">
        <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}

export function Stack() {
  const perRing = RINGS.map((_, i) => stack.filter((s) => s.ring === i))

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label="Tech stack orbit">
      <title>Stack — React, Three.js, TypeScript, WebGL, Next.js, Tailwind, Node, Blender, Python, Gemini, Vite</title>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#080c1c" />
          <stop offset="50%" stopColor={theme.bg} />
          <stop offset="100%" stopColor="#0a0717" />
        </linearGradient>
        <radialGradient id="coreHalo">
          <stop offset="0%" stopColor={theme.cyan} stopOpacity={0.35} />
          <stop offset="60%" stopColor={theme.violet} stopOpacity={0.12} />
          <stop offset="100%" stopColor={theme.violet} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="coreEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.mint} />
          <stop offset="100%" stopColor={theme.cyan} />
        </linearGradient>
        <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.violet} stopOpacity={0.15} />
          <stop offset="50%" stopColor={theme.cyan} stopOpacity={0.55} />
          <stop offset="100%" stopColor={theme.magenta} stopOpacity={0.15} />
        </linearGradient>
        <Glow id="glow" blur={3} />
        <SoftGlow id="soft" blur={16} />
        <clipPath id="panel">
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#panel)">
        <rect width={W} height={H} fill="url(#bg)" />
        <Stars count={54} width={W} height={H} seed={3} maxR={1.2} />

        {/* orbit paths */}
        {RINGS.map((r, i) => (
          <path
            key={i}
            d={ellipsePath(CX, CY, r.rx, r.ry, r.rot)}
            fill="none"
            stroke="url(#ringStroke)"
            strokeWidth={1.1}
            strokeDasharray="4 8"
          >
            <animate attributeName="stroke-opacity" values="0.55;0.9;0.55" dur={`${6 + i * 2}s`} repeatCount="indefinite" />
          </path>
        ))}

        <Core />

        {perRing.map((items, ringIndex) =>
          items.map((item, j) => (
            <OrbitingIcon
              key={item.slug}
              slug={item.slug}
              ring={RINGS[ringIndex]}
              phase={j / items.length}
            />
          )),
        )}

        {/* label */}
        <g>
          <rect x={40} y={36} width={22} height={2.5} rx={1.25} fill={theme.mint} />
          <VText size={12} weight="bold" tracking={5} x={74} y={42} fill={theme.muted}>
            TOOLKIT / REAL-TIME 3D
          </VText>
        </g>
        <VText size={11} weight="semi_bold" tracking={3.6} x={W - 40} y={42} anchor="end" fill={theme.muted} opacity={0.8}>
          11 TOOLS IN ORBIT
        </VText>

        <Brackets x={16} y={16} w={W - 32} h={H - 32} len={22} colour={theme.violet} opacity={0.45} />
      </g>
      <rect width={W} height={H} rx={20} fill="none" stroke={theme.line} strokeWidth={1.5} />
    </svg>
  )
}
