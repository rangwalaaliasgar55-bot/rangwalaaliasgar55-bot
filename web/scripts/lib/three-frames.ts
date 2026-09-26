/**
 * Bakes *real* 3D into static SVG.
 *
 * SVG has no 3D pipeline and GitHub strips <script>, so instead we run three.js
 * here at build time, project a rotating mesh through a perspective camera for
 * N frames, and emit the coordinates as SMIL keyframes. The browser then plays
 * genuine 3D rotation (with depth-based shading) from a plain <img>.
 */
import * as THREE from 'three'

const r = (n: number) => Math.round(n * 10) / 10
const r3 = (n: number) => Math.round(n * 1000) / 1000

export type Camera = {
  cx: number
  cy: number
  /** pixels per unit at the origin plane */
  scale: number
  /** camera distance along +Z */
  dist?: number
  focal?: number
}

export type Edge = {
  /** one "M x y L x y" per frame */
  frames: string[]
  /** 0..1 depth cue per frame (1 = closest to the camera) */
  depth: number[]
}

export type Vertex = {
  x: string[]
  y: string[]
  depth: number[]
}

export type Wireframe = {
  edges: Edge[]
  vertices: Vertex[]
}

function project(v: THREE.Vector3, cam: Camera) {
  const dist = cam.dist ?? 4.2
  const focal = cam.focal ?? 2.6
  const z = Math.max(0.25, dist - v.z)
  const k = (focal / z) * cam.scale
  return { x: cam.cx + v.x * k, y: cam.cy - v.y * k, z }
}

function uniqueVertices(geometry: THREE.BufferGeometry) {
  const pos = geometry.getAttribute('position')
  const seen = new Map<string, THREE.Vector3>()
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i)
    const key = `${v.x.toFixed(3)}|${v.y.toFixed(3)}|${v.z.toFixed(3)}`
    if (!seen.has(key)) seen.set(key, v)
  }
  return [...seen.values()]
}

/**
 * @param spin  full turns around Y over one loop (keep integral so it loops)
 */
export function bakeWireframe(
  geometry: THREE.BufferGeometry,
  opts: {
    cam: Camera
    frames?: number
    tiltX?: number
    tiltZ?: number
    spin?: number
    wobble?: number
    edgeAngle?: number
  },
): Wireframe {
  const frames = opts.frames ?? 24
  const tiltX = opts.tiltX ?? 0.42
  const tiltZ = opts.tiltZ ?? 0.12
  const spin = opts.spin ?? 1
  const wobble = opts.wobble ?? 0

  const edgeGeom = new THREE.EdgesGeometry(geometry, opts.edgeAngle ?? 1)
  const ep = edgeGeom.getAttribute('position')
  const edgeCount = ep.count / 2

  const verts = uniqueVertices(geometry)

  const edges: Edge[] = Array.from({ length: edgeCount }, () => ({ frames: [], depth: [] }))
  const vertices: Vertex[] = verts.map(() => ({ x: [], y: [], depth: [] }))

  // depth range for normalising the shading
  const dist = opts.cam.dist ?? 4.2

  for (let f = 0; f < frames; f++) {
    const t = f / frames
    const euler = new THREE.Euler(
      tiltX + Math.sin(t * Math.PI * 2) * wobble,
      t * Math.PI * 2 * spin,
      tiltZ,
      'XYZ',
    )
    const m = new THREE.Matrix4().makeRotationFromEuler(euler)

    for (let e = 0; e < edgeCount; e++) {
      const a = new THREE.Vector3().fromBufferAttribute(ep, e * 2).applyMatrix4(m)
      const b = new THREE.Vector3().fromBufferAttribute(ep, e * 2 + 1).applyMatrix4(m)
      const pa = project(a, opts.cam)
      const pb = project(b, opts.cam)
      edges[e].frames.push(`M${r(pa.x)} ${r(pa.y)}L${r(pb.x)} ${r(pb.y)}`)
      const mid = (pa.z + pb.z) / 2
      // 1 near, 0 far
      edges[e].depth.push(r3(THREE.MathUtils.clamp((dist + 1 - mid) / 2, 0, 1)))
    }

    verts.forEach((v0, i) => {
      const p = project(v0.clone().applyMatrix4(m), opts.cam)
      vertices[i].x.push(String(r(p.x)))
      vertices[i].y.push(String(r(p.y)))
      vertices[i].depth.push(r3(THREE.MathUtils.clamp((dist + 1 - p.z) / 2, 0, 1)))
    })
  }

  // close the loop so SMIL interpolates back to the first frame smoothly
  const close = <T,>(a: T[]) => [...a, a[0]]
  return {
    edges: edges.map((e) => ({ frames: close(e.frames), depth: close(e.depth) })),
    vertices: vertices.map((v) => ({ x: close(v.x), y: close(v.y), depth: close(v.depth) })),
  }
}

/** Ground plane that scrolls toward the camera, in true perspective. */
export function bakeGrid(opts: {
  width: number
  horizon: number
  bottom: number
  rows?: number
  cols?: number
  frames?: number
  camHeight?: number
  focal?: number
  spacing?: number
}) {
  const { width, horizon, bottom } = opts
  const rows = opts.rows ?? 22
  const cols = opts.cols ?? 26
  const frames = opts.frames ?? 20
  const h = opts.camHeight ?? 1
  const focal = opts.focal ?? 1.15
  const spacing = opts.spacing ?? 1.05
  const cx = width / 2

  // vertical lines converge on the vanishing point — static, one path
  const colPath: string[] = []
  for (let c = -cols; c <= cols; c++) {
    const x = c * spacing
    const zNear = 0.9
    const zFar = 90
    const yNear = horizon + (focal * h * (bottom - horizon)) / zNear
    const sxNear = cx + (focal * x * (bottom - horizon)) / zNear
    const yFar = horizon + (focal * h * (bottom - horizon)) / zFar
    const sxFar = cx + (focal * x * (bottom - horizon)) / zFar
    colPath.push(`M${r(sxNear)} ${r(Math.min(yNear, bottom + 200))}L${r(sxFar)} ${r(yFar)}`)
  }

  // horizontal lines sweep toward the viewer
  const rowFrames: string[] = []
  for (let f = 0; f <= frames; f++) {
    const frac = f / frames
    const segs: string[] = []
    for (let i = 0; i < rows; i++) {
      const z = (i + frac) * spacing + 0.9
      const y = horizon + (focal * h * (bottom - horizon)) / z
      // never skip a row: SMIL needs an identical path structure in every frame
      segs.push(`M0 ${r(y)}L${width} ${r(y)}`)
    }
    rowFrames.push(segs.join(''))
  }

  return { cols: colPath.join(''), rowFrames }
}
