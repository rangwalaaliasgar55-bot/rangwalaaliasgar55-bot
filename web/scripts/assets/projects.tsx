import * as React from 'react'
import * as THREE from 'three'
import { projects } from '../../src/data/profile'
import { theme } from '../../src/data/theme'
import { bakeWireframe } from '../lib/three-frames'
import { Chip, Glow, SoftGlow, VText, chipWidth, widthOf } from '../lib/ui'

const W = 1200
const H = 400
const MARGIN = 20
const GAP = 16
const CARD_W = (W - MARGIN * 2 - GAP * 3) / 4 // 278
const CARD_H = 318
const CARD_Y = 52

const SOLIDS = [
  () => new THREE.TetrahedronGeometry(1, 0),
  () => new THREE.BoxGeometry(1.35, 1.35, 1.35),
  () => new THREE.OctahedronGeometry(1.15, 0),
  () => new THREE.IcosahedronGeometry(1.1, 0),
]

function Card({ index }: { index: number }) {
  const p = projects[index]
  const x = MARGIN + index * (CARD_W + GAP)
  const solidCY = 92
  const cam = { cx: CARD_W / 2, cy: solidCY, scale: 50, dist: 4.6, focal: 2.8 }
  const { edges, vertices } = bakeWireframe(SOLIDS[index](), {
    cam,
    frames: 15,
    tiltX: 0.45,
    tiltZ: 0.1,
    spin: 1,
    wobble: 0.25,
  })
  const dur = `${13 + index * 2}s`
  const delay = index * 0.55

  let chipX = 22
  const barW = CARD_W - 44

  return (
    <g transform={`translate(${x} ${CARD_Y})`}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`${x} ${CARD_Y};${x} ${CARD_Y - 7};${x} ${CARD_Y}`}
        dur="6s"
        begin={`-${delay}s`}
        repeatCount="indefinite"
      />

      {/* extruded side + drop shadow */}
      <path
        d={`M${CARD_W - 16} 10L${CARD_W} 26L${CARD_W} ${CARD_H - 6}L${CARD_W - 16} ${CARD_H + 10}L14 ${CARD_H + 10}L0 ${CARD_H - 6}L${CARD_W - 16} ${CARD_H - 6}Z`}
        fill={p.accent}
        fillOpacity={0.14}
      />
      <rect x={6} y={12} width={CARD_W} height={CARD_H} rx={16} fill={p.accent} fillOpacity={0.07} />

      {/* card face */}
      <rect width={CARD_W} height={CARD_H} rx={16} fill="url(#cardFill)" stroke={p.accent} strokeOpacity={0.4} strokeWidth={1.2} />
      <rect width={CARD_W} height={CARD_H} rx={16} fill={p.accent} fillOpacity={0.04} />

      {/* accent rail */}
      <rect x={CARD_W / 2 - 46} y={0} width={92} height={3} rx={1.5} fill={p.accent} filter="url(#glow)">
        <animate attributeName="opacity" values="0.55;1;0.55" dur="3.5s" begin={`-${delay}s`} repeatCount="indefinite" />
      </rect>

      {/* index */}
      <VText size={11} weight="bold" tracking={2} x={CARD_W - 20} y={30} anchor="end" fill={p.accent} opacity={0.75}>
        {`0${index + 1}`}
      </VText>

      {/* rotating solid */}
      <circle cx={CARD_W / 2} cy={solidCY} r={58} fill={p.accent} fillOpacity={0.09} filter="url(#soft)" />
      <g filter="url(#glow)">
        {edges.map((e, i) => (
          <path key={i} d={e.frames[0]} fill="none" stroke={p.accent} strokeWidth={1.35} strokeLinecap="round">
            <animate attributeName="d" values={e.frames.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
            <animate
              attributeName="stroke-opacity"
              values={e.depth.map((d) => Math.round((0.22 + d * 0.78) * 100) / 100).join(';')}
              dur={dur}
              repeatCount="indefinite"
              calcMode="linear"
            />
          </path>
        ))}
      </g>
      {vertices.map((v, i) => (
        <circle key={i} cx={v.x[0]} cy={v.y[0]} r={2} fill="#ffffff">
          <animate attributeName="cx" values={v.x.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
          <animate attributeName="cy" values={v.y.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
          <animate
            attributeName="opacity"
            values={v.depth.map((d) => Math.round((0.3 + d * 0.7) * 100) / 100).join(';')}
            dur={dur}
            repeatCount="indefinite"
            calcMode="linear"
          />
        </circle>
      ))}

      {/* copy */}
      <VText size={21} weight="black" tracking={1.2} x={22} y={196} fill={theme.text}>
        {p.name}
      </VText>
      <VText size={12} weight="medium" tracking={0.4} x={22} y={218} fill={theme.muted}>
        {p.blurb}
      </VText>

      {/* tech chips */}
      <g transform="translate(0 238)">
        {p.tech.map((t) => {
          const cx = chipX
          chipX += chipWidth(t, 9.5) + 6
          return <Chip key={t} label={t} x={cx} y={0} size={9.5} colour={p.accent} />
        })}
      </g>

      {/* progress */}
      <g transform={`translate(22 ${CARD_H - 40})`}>
        <rect width={barW} height={5} rx={2.5} fill={theme.line} fillOpacity={0.8} />
        <rect width={barW * p.progress} height={5} rx={2.5} fill={p.accent} filter="url(#glow)">
          <animate
            attributeName="width"
            values={`0;${Math.round(barW * p.progress)};${Math.round(barW * p.progress)}`}
            keyTimes="0;0.35;1"
            dur="6s"
            begin={`-${delay}s`}
            repeatCount="indefinite"
          />
        </rect>
        <VText size={9.5} weight="bold" tracking={1.6} x={0} y={22} fill={theme.muted}>
          SHIPPED
        </VText>
        <VText size={9.5} weight="bold" tracking={1.6} x={barW} y={22} anchor="end" fill={p.accent}>
          {`${Math.round(p.progress * 100)}%`}
        </VText>
      </g>
    </g>
  )
}

export function Projects() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label="Flagship projects">
      <title>Flagship projects</title>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#070b1a" />
          <stop offset="100%" stopColor="#05070f" />
        </linearGradient>
        <linearGradient id="cardFill" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#101733" />
          <stop offset="100%" stopColor="#080c1d" />
        </linearGradient>
        <Glow id="glow" blur={2.6} />
        <SoftGlow id="soft" blur={18} />
        <clipPath id="panel">
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#panel)">
        <rect width={W} height={H} fill="url(#bg)" />

        <g>
          <rect x={MARGIN} y={26} width={22} height={2.5} rx={1.25} fill={theme.magenta} />
          <VText size={12} weight="bold" tracking={5} x={MARGIN + 34} y={32} fill={theme.muted}>
            FLAGSHIP BUILDS
          </VText>
          <VText size={11} weight="semi_bold" tracking={3.6} x={W - MARGIN} y={32} anchor="end" fill={theme.muted} opacity={0.8}>
            LIVE / IN ORBIT
          </VText>
        </g>

        {projects.map((_, i) => (
          <Card key={i} index={i} />
        ))}
      </g>
      <rect width={W} height={H} rx={20} fill="none" stroke={theme.line} strokeWidth={1.5} />
    </svg>
  )
}
