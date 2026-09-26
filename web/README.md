# web — the 3D layer of this profile

One React codebase produces **two** things:

| Output | What it is | Command |
| --- | --- | --- |
| `../assets/*.svg` | The animated README artwork — React components rendered to self-hosted SVG | `npm run assets` |
| `dist/` | The live React Three Fiber site published to GitHub Pages | `npm run build` |

Both read the same source of truth: [`src/data/profile.ts`](src/data/profile.ts) and
[`src/data/theme.ts`](src/data/theme.ts). Change a project name once and the README art, the 3D
site and the page metadata all follow.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run assets:png   # rebuild README art + PNG previews in .preview/
npm run check        # typecheck → headless scene test → production build
```

## How the README art gets its 3D

SVG has no 3D pipeline and GitHub strips `<script>` from images, so the depth is **baked at build
time**:

1. `scripts/lib/three-frames.ts` spins a real `three.js` geometry, projects every edge through a
   perspective camera for N frames and emits the coordinates as SMIL keyframes.
2. `scripts/lib/font.ts` compiles text into vector outlines from the Inter typeface JSON, so the
   layout is pixel-identical everywhere — no web fonts, no fallback metrics surprises.
3. `scripts/assets/*.tsx` composes those primitives into the hero, the orbiting stack, the project
   cards, the isometric field, the buttons and the footer.
4. `scripts/build-readme-assets.tsx` renders each component with `react-dom/server` and writes
   `../assets/*.svg`.

Every graphic keeps a sensible *static* first frame, so it still looks right in editors, npm pages
and social previews that do not play SMIL.

## How the site is put together

```
src/
  scene/        four levels stacked in one continuous 3D shaft
    Crystal          distorting icosahedron + wireframe shell + orbit rings
    TechOrbit        toolkit sprites (Simple Icons painted onto canvas textures)
    ProjectSolids    one platonic solid per flagship build, reacts to card hover
    CubeWave         instanced rippling cube field
    Experience       camera rig, lights, bloom, vignette, adaptive DPR
  ui/           DOM overlay: topbar, section nav, copy, glass cards, loader
  lib/store.ts  frame-rate mutable state shared with the scene (never re-renders React)
```

Scroll position drives the camera down the shaft; the pointer adds parallax. If WebGL is missing or
the scene throws, `ui/Fallback.tsx` swaps in a CSS-only backdrop so the content is never lost.

## Tests

`npm run smoke` mounts the scene with `@react-three/test-renderer` (no GPU required), advances
frames so every `useFrame` callback executes, and server-renders the DOM overlay. CI runs it before every
deploy — a blank page can't ship.
