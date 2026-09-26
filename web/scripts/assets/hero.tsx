import * as React from 'react'
import * as THREE from 'three'
import { profile } from '../../src/data/profile'
import { theme } from '../../src/data/theme'
import { bakeGrid, bakeWireframe } from '../lib/three-frames'
import { text } from '../lib/font'
import { BrandGradient, Brackets, Glow, SoftGlow, Stars, VText, widthOf } from '../lib/ui'

const W = 1200
const H = 380
const HORIZON = 258

/* --------------------------------------------------------- typing block - */

function TypingLines({ x, y, lines }: { x: number; y: number; lines: readonly string[] }) {
  const size = 16
  const slot = 4.2
  const total = slot * lines.length
  const type = 1.3
  const hold = 2.2

  return (
    <g>
      <defs>
        {lines.map((line, i) => {
          const w = widthOf(line, { size, weight: 'semi_bold', tracking: 2.4 })
          const s = i * slot
          const t = (v: number) => Math.round((v / total) * 10000) / 10000
          const keyTimes = [0, t(s), t(s + type), t(s + type + hold), t(s + type + hold + 0.45), 1]
          const values = [0, 0, w, w, 0, 0]
          // keyTimes must be monotonically non-decreasing and start at 0 / end at 1
          const kt = keyTimes.map((v, idx) => Math.min(1, Math.max(v, keyTimes[idx - 1] ?? 0)))
          return (
            <clipPath key={i} id={`type-${i}`}>
              <rect x={x} y={y - size - 4} width={i === 0 ? Math.round(w) : 0} height={size + 12}>
                <animate
                  attributeName="width"
                  values={values.map((v) => Math.round(v * 10) / 10).join(';')}
                  keyTimes={kt.join(';')}
                  dur={`${total}s`}
                  repeatCount="indefinite"
                />
              </rect>
            </clipPath>
          )
        })}
      </defs>

      {lines.map((line, i) => {
        const w = widthOf(line, { size, weight: 'semi_bold', tracking: 2.4 })
        const s = i * slot
        const t = (v: number) => Math.round((v / total) * 10000) / 10000
        const keyTimes = [0, t(s), t(s + type), t(s + type + hold), t(s + type + hold + 0.45), 1]
        const kt = keyTimes.map((v, idx) => Math.min(1, Math.max(v, keyTimes[idx - 1] ?? 0)))
        const caret = [x, x, x + w, x + w, x, x].map((v) => Math.round(v * 10) / 10).join(';')
        return (
          <g key={i}>
            <g clipPath={`url(#type-${i})`}>
              <VText size={size} weight="semi_bold" tracking={2.4} x={x} y={y} fill={theme.cyan}>
                {line}
              </VText>
            </g>
            <rect x={x} y={y - size + 1} width={2.5} height={size + 3} fill={theme.mint}>
              <animate
                attributeName="x"
                values={caret}
                keyTimes={kt.join(';')}
                dur={`${total}s`}
                repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.24;0.25;0.74;0.75" dur="1s" repeatCount="indefinite" />
            </rect>
          </g>
        )
      })}
    </g>
  )
}

/* ------------------------------------------------------------- 3D solid - */

function Crystal() {
  const cam = { cx: 948, cy: 164, scale: 112, dist: 4.4, focal: 2.7 }
  const { edges, vertices } = bakeWireframe(new THREE.IcosahedronGeometry(1, 0), {
    cam,
    frames: 26,
    tiltX: 0.5,
    tiltZ: 0.1,
    spin: 1,
    wobble: 0.22,
  })
  const dur = '16s'

  return (
    <g>
      {/* halo */}
      <circle cx={cam.cx} cy={cam.cy} r={130} fill="url(#halo)" opacity={0.75}>
        <animate attributeName="opacity" values="0.45;0.85;0.45" dur="6s" repeatCount="indefinite" />
      </circle>

      {/* orbit rings */}
      <g opacity={0.5}>
        <g transform={`translate(${cam.cx} ${cam.cy})`}>
          <ellipse rx={158} ry={44} fill="none" stroke={theme.violet} strokeWidth={1.1} strokeDasharray="5 9" opacity={0.85}>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite" />
          </ellipse>
          <ellipse rx={126} ry={126} fill="none" stroke={theme.cyan} strokeWidth={0.9} strokeDasharray="2 12" opacity={0.5} />
          <ellipse rx={150} ry={52} fill="none" stroke={theme.cyan} strokeWidth={1} strokeDasharray="3 10" opacity={0.6} transform="rotate(62)">
            <animateTransform attributeName="transform" type="rotate" from="62" to="422" dur="30s" repeatCount="indefinite" />
          </ellipse>
        </g>
      </g>

      {/* core */}
      <circle cx={cam.cx} cy={cam.cy} r={16} fill="url(#core)" filter="url(#glow)">
        <animate attributeName="r" values="14;20;14" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* wireframe edges — real projected 3D, one keyframe list per edge */}
      <g filter="url(#glow)">
        {edges.map((e, i) => (
          <path
            key={i}
            d={e.frames[0]}
            fill="none"
            stroke="url(#edge)"
            strokeWidth={1.35}
            strokeLinecap="round"
          >
            <animate attributeName="d" values={e.frames.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
            <animate
              attributeName="stroke-opacity"
              values={e.depth.map((d) => Math.round((0.18 + d * 0.8) * 100) / 100).join(';')}
              dur={dur}
              repeatCount="indefinite"
              calcMode="linear"
            />
          </path>
        ))}
      </g>

      {/* vertices */}
      <g>
        {vertices.map((v, i) => (
          <circle key={i} cx={v.x[0]} cy={v.y[0]} r={2.6} fill="#ffffff">
            <animate attributeName="cx" values={v.x.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
            <animate attributeName="cy" values={v.y.join(';')} dur={dur} repeatCount="indefinite" calcMode="linear" />
            <animate
              attributeName="opacity"
              values={v.depth.map((d) => Math.round((0.25 + d * 0.75) * 100) / 100).join(';')}
              dur={dur}
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="r"
              values={v.depth.map((d) => Math.round((1.4 + d * 2.2) * 10) / 10).join(';')}
              dur={dur}
              repeatCount="indefinite"
              calcMode="linear"
            />
          </circle>
        ))}
      </g>
    </g>
  )
}

function StatusRow({ y }: { y: number }) {
  const size = 12
  const label = 'OPEN TO BUILD'
  const labelX = 22
  const sepX = labelX + widthOf(label, { size, weight: 'bold', tracking: 3.4 }) + 18
  return (
    <g transform={`translate(2 ${y})`}>
      <circle cx={6} cy={10} r={5} fill={theme.mint}>
        <animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={6} cy={10} r={5} fill="none" stroke={theme.mint} strokeWidth={1.2}>
        <animate attributeName="r" values="5;13;5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <VText size={size} weight="bold" tracking={3.4} x={labelX} y={14} fill={theme.mint}>
        {label}
      </VText>
      <rect x={sepX} y={2} width={1.2} height={15} fill={theme.line} />
      <VText size={size} weight="medium" tracking={3.4} x={sepX + 18} y={14} fill={theme.muted}>
        {profile.location.toUpperCase()}
      </VText>
    </g>
  )
}

/* ---------------------------------------------------------------- hero - */

export function Hero() {
  const grid = bakeGrid({ width: W, horizon: HORIZON, bottom: H, rows: 15, cols: 8, frames: 14, spacing: 1.15 })

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label={`${profile.fullName} — ${profile.role}`}>
      <title>{`${profile.fullName} — ${profile.role}`}</title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#0a0f24" />
          <stop offset="55%" stopColor={theme.bg} />
          <stop offset="100%" stopColor={theme.bgDeep} />
        </linearGradient>
        <radialGradient id="halo">
          <stop offset="0%" stopColor={theme.violet} stopOpacity={0.55} />
          <stop offset="55%" stopColor={theme.blue} stopOpacity={0.14} />
          <stop offset="100%" stopColor={theme.blue} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="blobA">
          <stop offset="0%" stopColor={theme.magenta} stopOpacity={0.5} />
          <stop offset="100%" stopColor={theme.magenta} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="core">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={theme.cyan} />
          <stop offset="100%" stopColor={theme.violet} stopOpacity={0.15} />
        </radialGradient>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.cyan} />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={theme.magenta} />
        </linearGradient>
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.cyan} stopOpacity={0} />
          <stop offset="28%" stopColor={theme.cyan} stopOpacity={0.5} />
          <stop offset="100%" stopColor={theme.magenta} stopOpacity={0.75} />
        </linearGradient>
        <BrandGradient id="brand" />
        <linearGradient id="nameFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={theme.cyan} />
          <stop offset="100%" stopColor={theme.violet} />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-1 0;1 0;1 0"
            keyTimes="0;0.55;1"
            dur="5s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.cyan} stopOpacity={0} />
          <stop offset="50%" stopColor={theme.cyan} stopOpacity={0.5} />
          <stop offset="100%" stopColor={theme.cyan} stopOpacity={0} />
        </linearGradient>
        <Glow id="glow" blur={3.5} />
        <SoftGlow id="soft" blur={14} />
        <path id="nameOutline" d={text(profile.name, { size: 78, weight: 'black', tracking: 2, x: 0, y: 164 }).d} fillRule="evenodd" />
        <clipPath id="frame">
          <rect width={W} height={H} rx={20} />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        <rect width={W} height={H} fill="url(#sky)" />
        <ellipse cx={170} cy={70} rx={320} ry={190} fill="url(#blobA)" opacity={0.55}>
          <animate attributeName="opacity" values="0.35;0.7;0.35" dur="9s" repeatCount="indefinite" />
        </ellipse>

        <Stars count={64} width={W} height={HORIZON} seed={21} />

        {/* perspective floor */}
        <g opacity={0.85}>
          <path d={grid.cols} stroke="url(#gridFade)" strokeWidth={1} fill="none" opacity={0.55} />
          <path d={grid.rowFrames[0]} stroke="url(#gridFade)" strokeWidth={1.15} fill="none" opacity={0.75}>
            <animate
              attributeName="d"
              values={[...grid.rowFrames, grid.rowFrames[0]].join(';')}
              dur="6s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </path>
        </g>

        {/* horizon glow */}
        <rect x={0} y={HORIZON - 1} width={W} height={2} fill={theme.cyan} opacity={0.32} filter="url(#glow)" />
        <ellipse cx={W / 2} cy={HORIZON} rx={520} ry={54} fill={theme.violet} opacity={0.2} filter="url(#soft)" />

        <Crystal />

        {/* ------------------------------------------------ identity block */}
        <g transform="translate(64 0)">
          {/* eyebrow */}
          <g>
            <rect x={0} y={76} width={26} height={3} rx={1.5} fill="url(#brand)">
              <animate attributeName="width" values="12;34;12" dur="4s" repeatCount="indefinite" />
            </rect>
            <VText size={12.5} weight="bold" tracking={5.6} x={42} y={82} fill={theme.muted}>
              PORTFOLIO / 2026
            </VText>
          </g>

          {/* extruded name — one outline, reused 11x for the extrusion */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="7s" repeatCount="indefinite" />
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((i) => (
              <use
                key={i}
                href="#nameOutline"
                x={i * 1.25}
                y={i * 1.25}
                fill={`rgb(${Math.round(96 - i * 6)},${Math.round(34 + i * 1.5)},${Math.round(170 - i * 11)})`}
                opacity={0.92 - i * 0.045}
              />
            ))}
            <use href="#nameOutline" fill="url(#nameFill)" filter="url(#glow)" />
            <use href="#nameOutline" fill="url(#sheen)" />
          </g>

          <TypingLines x={2} y={204} lines={profile.taglines} />

          {/* status row */}
          <StatusRow y={228} />
        </g>

        {/* HUD */}
        <Brackets x={16} y={16} w={W - 32} h={H - 32} len={26} />
        <g opacity={0.75}>
          <VText size={10.5} weight="semi_bold" tracking={2.6} x={W - 34} y={38} anchor="end" fill={theme.muted}>
            {profile.coords}
          </VText>
          <VText size={10.5} weight="semi_bold" tracking={2.6} x={W - 34} y={H - 26} anchor="end" fill={theme.muted}>
            WEBGL / R3F / GLSL
          </VText>
        </g>

        {/* scanline */}
        <rect x={0} y={0} width={W} height={90} fill="url(#scan)" opacity={0.1}>
          <animate attributeName="y" values={`-90;${H}`} dur="7s" repeatCount="indefinite" />
        </rect>
      </g>

      <rect width={W} height={H} rx={20} fill="none" stroke={theme.line} strokeWidth={1.5} />
    </svg>
  )
}
