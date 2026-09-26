/** Shared palette for the WebGL site and the generated README artwork. */
export const theme = {
  bg: '#05070f',
  bgDeep: '#02030a',
  panel: '#0b1022',
  line: '#1b2547',
  text: '#e8ecff',
  muted: '#8ea0c9',

  cyan: '#00E5FF',
  violet: '#8338EC',
  magenta: '#FF006E',
  mint: '#06FFA5',
  blue: '#3A86FF',
} as const

export const gradient = [theme.magenta, theme.violet, theme.blue, theme.cyan, theme.mint] as const
