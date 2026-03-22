import React from 'react'

function GuidanceCard() {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Orientações</h2>
        <span className="badge badge-muted">Apoio prático</span>
      </div>
      <div className="guidance-grid">
        <div>
          <h3>No começo</h3>
          <ul>
            <li>Não avisar a família logo no início.</li>
            <li>Comer e se hidratar.</li>
            <li>Não fazer exercícios.</li>
            <li>Dormir ou descansar sempre que possível.</li>
          </ul>
        </div>
        <div>
          <h3>Gatilhos</h3>
          <ul>
            <li>Avisar a doula na fase latente.</li>
            <li>Preparar ida ao hospital na fase ativa.</li>
            <li>Ir ao hospital na ativa persistente ou na transição.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default GuidanceCard
