import * as React from 'react'
import { profile, projects, stack, stats } from '../data/profile'
import { icons } from '../data/icons'
import { world } from '../lib/store'

function useTypewriter(lines: readonly string[], speed = 55, hold = 1700) {
  const [text, setText] = React.useState('')
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const line = lines[index % lines.length]
    let i = 0
    let timer: number
    const typing = () => {
      i += 1
      setText(line.slice(0, i))
      if (i < line.length) timer = window.setTimeout(typing, speed)
      else timer = window.setTimeout(erase, hold)
    }
    const erase = () => {
      i -= 2
      setText(line.slice(0, Math.max(0, i)))
      if (i > 0) timer = window.setTimeout(erase, speed / 2.2)
      else setIndex((n) => n + 1)
    }
    timer = window.setTimeout(typing, 260)
    return () => window.clearTimeout(timer)
  }, [index, lines, speed, hold])

  return text
}

function Icon({ slug, size = 18 }: { slug: keyof typeof icons; size?: number }) {
  const icon = icons[slug]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} fill={icon.hex} />
    </svg>
  )
}

export function Overlay() {
  const typed = useTypewriter(profile.taglines)

  return (
    <main className="overlay">
      {/* ------------------------------------------------------------ home */}
      <section className="section section--home" id="home">
        <div className="hero">
          <p className="eyebrow">
            <span className="eyebrow__bar" />
            PORTFOLIO / 2026
          </p>
          <h1 className="hero__name" data-text={profile.name}>
            {profile.name}
          </h1>
          <p className="hero__type">
            {typed}
            <span className="caret" />
          </p>
          <p className="hero__blurb">
            I build <strong>real-time 3D interfaces</strong> for the browser — shaders, physics and
            interaction design, shipped as fast, accessible React apps.
          </p>
          <div className="cta">
            <a className="btn btn--primary" href="#work">
              <span className="btn__play" />
              EXPLORE THE WORK
            </a>
            <a className="btn" href={profile.githubUrl} target="_blank" rel="noreferrer">
              <Icon slug="github" size={16} />
              GITHUB
            </a>
          </div>
          <ul className="stats">
            {stats.map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="scroll-hint">
          <span>SCROLL</span>
          <i />
        </div>
      </section>

      {/* ----------------------------------------------------------- stack */}
      <section className="section section--stack" id="stack">
        <div className="panel">
          <h2 className="heading">
            <span className="heading__index">01</span> TOOLKIT
          </h2>
          <p className="lede">Everything orbiting this page is hand-built with these.</p>
          <ul className="chips">
            {stack.map((item) => (
              <li key={item.slug} style={{ ['--accent' as string]: icons[item.slug].hex }}>
                <Icon slug={item.slug} />
                {icons[item.slug].label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ work */}
      <section className="section section--work" id="work">
        <div className="panel panel--wide">
          <h2 className="heading">
            <span className="heading__index">02</span> FLAGSHIP BUILDS
          </h2>
          <div className="cards">
            {projects.map((p, i) => (
              <article
                key={p.name}
                className="card"
                style={{ ['--accent' as string]: p.accent }}
                onPointerEnter={() => (world.hovered = i)}
                onPointerLeave={() => (world.hovered = -1)}
              >
                <header>
                  <span className="card__index">0{i + 1}</span>
                  <h3>{p.name}</h3>
                </header>
                <p>{p.blurb}</p>
                <ul className="card__tech">
                  {p.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="card__bar">
                  <i style={{ width: `${p.progress * 100}%` }} />
                </div>
                <span className="card__meta">SHIPPED {Math.round(p.progress * 100)}%</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- signal */}
      <section className="section section--signal" id="signal">
        <div className="panel panel--center">
          <h2 className="heading">
            <span className="heading__index">03</span> SIGNAL
          </h2>
          <p className="lede">
            Building something that needs depth? Let's put it in three dimensions.
          </p>
          <div className="cta cta--center">
            <a className="btn btn--primary" href={profile.githubUrl} target="_blank" rel="noreferrer">
              <Icon slug="github" size={16} />
              FOLLOW ON GITHUB
            </a>
            <a className="btn" href={profile.skylineUrl} target="_blank" rel="noreferrer">
              3D SKYLINE
            </a>
          </div>
          <footer className="footnote">
            <span>{profile.location}</span>
            <span>{profile.coords}</span>
            <span>REACT · THREE.JS · WEBGL</span>
          </footer>
        </div>
      </section>
    </main>
  )
}
