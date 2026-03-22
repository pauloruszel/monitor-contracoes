import React from 'react'

function HistoryList({ contractions, intervals, formatClockTime, formatDuration, open, onToggleOpen }) {
  const items = [...contractions].reverse()

  return (
    <section className="card">
      <div className="card-header">
        <h2>Histórico</h2>
        <span className="badge badge-muted">Mais recentes primeiro</span>
      </div>
      <div className="collapsible-toggle-row">
        <button className="button button-secondary" onClick={onToggleOpen} type="button">
          {open ? 'Ocultar histórico' : `Ver histórico (${items.length})`}
        </button>
      </div>
      {open ? (
        items.length === 0 ? (
          <p className="support-text">Nenhuma contração registrada ainda.</p>
        ) : (
          <div className="history-list">
            {items.map((contraction) => {
              const originalIndex = contractions.findIndex((item) => item.id === contraction.id)
              const interval = originalIndex > 0 ? intervals[originalIndex - 1] : null
              return (
                <article className="history-item" key={contraction.id}>
                  <div>
                    <strong>{formatClockTime(contraction.start)}</strong>
                    <p className="support-text">Fim às {formatClockTime(contraction.end)}</p>
                  </div>
                  <div className="history-metrics">
                    <span>Duração {formatDuration(contraction.durationSeconds)}</span>
                    <span>Intervalo {interval ? formatDuration(interval) : '--'}</span>
                    <span>Como ela estava {getWellbeingLabel(contraction.wellbeing)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )
      ) : null}
    </section>
  )
}

function getWellbeingLabel(value) {
  if (value === 'red') return 'muita dor'
  if (value === 'yellow') return 'mais desconfortável'
  return 'bem'
}

export default HistoryList
