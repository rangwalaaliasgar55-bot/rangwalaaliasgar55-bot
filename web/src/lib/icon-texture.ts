import * as THREE from 'three'
import { icons, type IconSlug } from '../data/icons'

const cache = new Map<string, THREE.CanvasTexture>()

/**
 * Paints a Simple Icons glyph (24x24 path data) onto a canvas "chip" and hands
 * back a texture — no image files, no network, brand colours intact.
 */
export function iconTexture(slug: IconSlug): THREE.CanvasTexture {
  const hit = cache.get(slug)
  if (hit) return hit

  const icon = icons[slug]
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2

  // chip
  ctx.beginPath()
  ctx.arc(c, c, size * 0.42, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(8,12,28,0.92)'
  ctx.fill()

  ctx.lineWidth = size * 0.022
  ctx.strokeStyle = icon.hex
  ctx.shadowColor = icon.hex
  ctx.shadowBlur = size * 0.09
  ctx.stroke()
  ctx.shadowBlur = 0

  // glyph
  const box = size * 0.46
  ctx.save()
  ctx.translate(c - box / 2, c - box / 2)
  ctx.scale(box / 24, box / 24)
  ctx.fillStyle = icon.hex === '#FFFFFF' ? '#ffffff' : icon.hex
  ctx.fill(new Path2D(icon.path))
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  cache.set(slug, texture)
  return texture
}
