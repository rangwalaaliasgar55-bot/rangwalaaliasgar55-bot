import * as React from 'react'
import { profile } from '../data/profile'

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

/** Keeps the page useful if WebGL is unavailable or the scene throws. */
export class SceneBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[scene] falling back to the static layer:', error)
  }

  render() {
    if (this.state.failed) return <StaticBackdrop />
    return this.props.children
  }
}

export function StaticBackdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__grid" />
      <div className="backdrop__orb backdrop__orb--a" />
      <div className="backdrop__orb backdrop__orb--b" />
      <p className="backdrop__note">
        WebGL is off — showing the lightweight version of {profile.fullName}'s space.
      </p>
    </div>
  )
}
