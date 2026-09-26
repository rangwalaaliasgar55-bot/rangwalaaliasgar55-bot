import * as React from 'react'
import { SECTIONS, type SectionId } from '../lib/store'
import { profile } from '../data/profile'

const LABELS: Record<SectionId, string> = {
  home: 'HOME',
  stack: 'STACK',
  work: 'WORK',
  signal: 'SIGNAL',
}

export function Nav({ active }: { active: SectionId }) {
  return (
    <>
      <header className="topbar">
        <a className="topbar__brand" href="#home">
          <span className="topbar__dot" />
          {profile.fullName}
        </a>
        <div className="topbar__right">
          <span className="topbar__status">
            <i /> OPEN TO BUILD
          </span>
          <a className="topbar__link" href={profile.githubUrl} target="_blank" rel="noreferrer">
            GITHUB
          </a>
        </div>
      </header>

      <nav className="dots" aria-label="Sections">
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} className={`dots__item ${active === id ? 'is-active' : ''}`}>
            <span className="dots__label">{LABELS[id]}</span>
            <span className="dots__dot" />
          </a>
        ))}
      </nav>
    </>
  )
}
