/** Each page section lives at its own depth in one continuous 3D shaft. */
export const LEVEL = {
  home: 0,
  stack: -9,
  work: -18,
  signal: -27,
} as const

export const TRAVEL = -LEVEL.signal
