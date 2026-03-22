import React from 'react'

function PhaseCard({ phase }) {
  return (
    <section className={`card phase-card phase-${phase.urgency}`}>
      <div className="card-header">
        <h2>Fase provável</h2>
        <span className="badge badge-muted">{phase.patternLabel}</span>
      </div>
      <h3>{phase.label}</h3>
      <p>{phase.description}</p>
    </section>
  )
}

export default PhaseCard
