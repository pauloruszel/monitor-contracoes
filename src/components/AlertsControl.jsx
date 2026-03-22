import React from 'react'

function AlertsControl({ alertsEnabled, onToggle }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Alertas automáticos</h2>
        <span className={`badge ${alertsEnabled ? 'badge-live' : 'badge-muted'}`}>
          {alertsEnabled ? 'Ativos' : 'Desligados'}
        </span>
      </div>
      <p className="support-text">
        Usa notificação do navegador, voz sintetizada e um som curto quando a fase muda.
      </p>
      <button className="button button-alert" onClick={onToggle}>
        {alertsEnabled ? 'Desativar alertas' : 'Ativar alertas'}
      </button>
    </section>
  )
}

export default AlertsControl
