import * as React from 'react'

export function Loader({ done }: { done: boolean }) {
  const [hidden, setHidden] = React.useState(false)

  React.useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setHidden(true), 900)
    return () => clearTimeout(t)
  }, [done])

  if (hidden) return null

  return (
    <div className={`loader ${done ? 'loader--out' : ''}`}>
      <div className="loader__mark">
        <span />
        <span />
        <span />
      </div>
      <p className="loader__label">COMPILING SHADERS</p>
    </div>
  )
}
