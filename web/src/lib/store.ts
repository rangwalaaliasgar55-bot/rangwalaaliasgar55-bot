/**
 * Tiny mutable store shared between the DOM overlay and the WebGL scene.
 * Deliberately not React state — it changes every frame and must never
 * trigger a re-render.
 */
export const world = {
  /** 0..1 over the whole page */
  scroll: 0,
  /** smoothed pointer, -1..1 */
  pointer: { x: 0, y: 0 },
  /** index of the project card under the cursor, -1 when none */
  hovered: -1,
  /** set once the intro has played */
  ready: false,
  /** halves the work when the tab is unfocused or the device is slow */
  quality: 1,
}

export const SECTIONS = ['home', 'stack', 'work', 'signal'] as const
export type SectionId = (typeof SECTIONS)[number]
