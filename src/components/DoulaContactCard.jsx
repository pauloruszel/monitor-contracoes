import React from 'react'

function DoulaContactCard({ doulaPhone, onChangePhone, whatsAppUrl, canSendSummary, sendSummaryHint }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Contato rápido da doula</h2>
          <p className="support-text compact-text">
            Abre o WhatsApp com um resumo curto da sessão atual e, se houver, inclui o link ao vivo.
          </p>
        </div>
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
      <p className="support-text compact-text">{sendSummaryHint}</p>
      <a
        className={`button button-whatsapp ${whatsAppUrl ? '' : 'button-disabled'}`}
        href={whatsAppUrl || '#'}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!canSendSummary}
        onClick={(event) => {
          if (!whatsAppUrl) event.preventDefault()
        }}
      >
        Enviar resumo no WhatsApp
      </a>
    </section>
  )
}

export default DoulaContactCard
