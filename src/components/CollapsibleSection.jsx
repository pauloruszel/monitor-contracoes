import React from 'react'

function CollapsibleSection({
  title,
  description,
  badge,
  open,
  onToggle,
  children,
  countLabel = '',
}) {
  return (
    <section className={`collapsible-section ${open ? 'collapsible-section-open' : ''}`}>
      <div className="collapsible-section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="support-text compact-text">{description}</p> : null}
        </div>
        <div className="collapsible-section-actions">
          {badge ? <span className="badge badge-muted">{badge}</span> : null}
          <button className="button button-secondary" onClick={onToggle} type="button">
            {open ? 'Ocultar' : `Ver${countLabel ? ` ${countLabel}` : ''}`}
          </button>
        </div>
      </div>
      {open ? <div className="collapsible-section-content">{children}</div> : null}
    </section>
  )
}

export default CollapsibleSection
