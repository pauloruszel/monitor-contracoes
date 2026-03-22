import React from 'react'

function DoulaContactCard({ doulaPhone, onChangePhone, whatsAppUrl }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>WhatsApp da doula Raquel</h2>
        <span className="badge badge-muted">Contato rápido</span>
      </div>
      <label className="field">
        <span>Número com DDI</span>
        <input
          type="tel"
          placeholder="5521981688856"
          value={doulaPhone}
          onChange={(event) => onChangePhone(event.target.value)}
        />
      </label>
      <a
        className={`button button-whatsapp ${whatsAppUrl ? '' : 'button-disabled'}`}
        href={whatsAppUrl || '#'}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          if (!whatsAppUrl) event.preventDefault()
        }}
      >
        Avisar doula no WhatsApp
      </a>
    </section>
  )
}

export default DoulaContactCard
