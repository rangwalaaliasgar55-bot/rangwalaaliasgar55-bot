import type { IconSlug } from './icons'

/**
 * Single source of truth.
 * Both the live React/WebGL site and the animated README artwork are rendered
 * from this file — change it once, run `npm run assets`, and everything updates.
 */

export const profile = {
  name: 'ALIASGAR',
  fullName: 'Aliasgar Rangwala',
  handle: 'rangwalaaliasgar55-bot',
  location: 'Indore, India',
  coords: '22.72°N / 75.85°E',
  role: '3D Web Engineer',
  taglines: [
    'CRAFTING IMMERSIVE 3D ON THE WEB',
    'REACT · THREE.JS · WEBGL',
    'REAL-TIME INTERFACES & SHADERS',
  ],
  liveSite: 'https://rangwalaaliasgar55-bot.github.io/rangwalaaliasgar55-bot/',
  githubUrl: 'https://github.com/rangwalaaliasgar55-bot',
  skylineUrl: 'https://skyline.github.com/rangwalaaliasgar55-bot/2026',
} as const

export type StackItem = {
  slug: IconSlug
  /** orbit ring index, 0 = innermost */
  ring: 0 | 1 | 2
}

export const stack: StackItem[] = [
  { slug: 'react', ring: 0 },
  { slug: 'three', ring: 0 },
  { slug: 'typescript', ring: 0 },
  { slug: 'webgl', ring: 1 },
  { slug: 'next', ring: 1 },
  { slug: 'tailwind', ring: 1 },
  { slug: 'node', ring: 1 },
  { slug: 'blender', ring: 2 },
  { slug: 'python', ring: 2 },
  { slug: 'gemini', ring: 2 },
  { slug: 'vite', ring: 2 },
]

export type Project = {
  name: string
  blurb: string
  tech: string[]
  accent: string
  /** 0..1 — how "shipped" it is, drives the little progress bars */
  progress: number
}

export const projects: Project[] = [
  {
    name: 'FOCUSARX',
    blurb: 'Immersive deep-work OS',
    tech: ['Three.js', 'React 19', 'WebGL'],
    accent: '#00E5FF',
    progress: 0.92,
  },
  {
    name: 'GEMAIR',
    blurb: 'AI companion with a 3D UI',
    tech: ['Gemini', 'Canvas', 'Realtime'],
    accent: '#8338EC',
    progress: 0.78,
  },
  {
    name: 'VISIONFOLD',
    blurb: 'Cinematic 3D portfolios',
    tech: ['Next.js', 'GLSL', 'R3F'],
    accent: '#FF006E',
    progress: 0.85,
  },
  {
    name: 'SOCIALBOT',
    blurb: 'Live analytics, visualised',
    tech: ['Node.js', 'Python', 'D3'],
    accent: '#06FFA5',
    progress: 0.7,
  },
]

export const stats = [
  { label: 'COMMITS', value: '854' },
  { label: 'STARS', value: '36' },
  { label: 'PULL REQUESTS', value: '39' },
  { label: 'PROJECTS', value: '12' },
]
