import * as React from 'react'
import { theme } from '../../src/data/theme'
import { Glow } from '../lib/ui'

const W = 1200
const H = 26

export function Divider() {
  const mid = H / 2
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label="">
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.magenta} stopOpacity={0} />
          <stop offset="25%" stopColor={theme.violet} stopOpacity={0.7} />
          <stop offset="50%" stopColor={theme.cyan} stopOpacity={0.9} />
          <stop offset="75%" stopColor={theme.mint} stopOpacity={0.7} />
          <stop offset="100%" stopColor={theme.mint} stopOpacity={0} />
        </linearGradient>
        <Glow id="glow" blur={3} />
      </defs>

      <rect x={0} y={mid - 0.75} width={W} height={1.5} fill="url(#beam)" opacity={0.55} />

      {/* tick marks */}
      {Array.from({ length: 41 }, (_, i) => {
        const x = 20 + i * ((W - 40) / 40)
        const tall = i % 5 === 0
        return (
          <rect
            key={i}
            x={x}
            y={mid - (tall ? 5 : 2.5)}
            width={1}
            height={tall ? 10 : 5}
            fill={theme.cyan}
            opacity={tall ? 0.35 : 0.18}
          />
        )
      })}

      {/* travelling pulse */}
      <g filter="url(#glow)">
        <circle cx={0} cy={mid} r={3.4} fill="#ffffff">
          <animate attributeName="cx" values={`-20;${W + 20}`} dur="6s" repeatCount="indefinite" />
        </circle>
        <rect x={-90} y={mid - 1.25} width={90} height={2.5} rx={1.25} fill={theme.cyan} opacity={0.75}>
          <animate attributeName="x" values={`-110;${W}`} dur="6s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* centre diamond */}
      <g transform={`translate(${W / 2} ${mid})`}>
        <rect x={-5} y={-5} width={10} height={10} fill={theme.bg} stroke={theme.cyan} strokeWidth={1.3} transform="rotate(45)">
          <animateTransform attributeName="transform" type="rotate" from="45" to="405" dur="12s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  )
}
