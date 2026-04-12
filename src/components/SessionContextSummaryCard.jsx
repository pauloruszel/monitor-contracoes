import React from 'react'
import {
  getActiveSessionContextItems,
  getClinicalContextItems,
} from '../utils/sessionContextUtils'

function SessionContextSummaryCard({
  sessionContext,
  userProfile,
  clinicalPreferences,
  mode = 'monitor',
}) {
  const operationalItems = getActiveSessionContextItems(sessionContext)
  const clinicalItems = getClinicalContextItems({ userProfile, clinicalPreferences })
  const hasNotes = Boolean(sessionContext?.notes?.trim())

  if (operationalItems.length === 0 && clinicalItems.length === 0 && !hasNotes) {
    return (
      <section className="card">
        <div className="card-header">
          <div>
            <h2>Contexto da sess\u00e3o</h2>
            <p className="support-text compact-text">
              {mode === 'doula'
                ? 'Ainda n\u00e3o h\u00e1 contexto adicional compartilhado nesta sess\u00e3o.'
                : 'Preencha os campos abaixo quando houver algo que realmente mude a leitura ou ajude a doula.'}
            </p>
          </div>
          <span className="badge badge-muted">Resumo</span>
        </div>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Contexto da sess\u00e3o</h2>
          <p className="support-text compact-text">
            {mode === 'doula'
              ? 'Resumo do contexto compartilhado para interpretar melhor a evolucao.'
              : 'So aparecem aqui os itens que podem mudar a leitura ou alinhar o acompanhamento.'}
          </p>
        </div>
        <span className="badge badge-muted">Resumo</span>
      </div>

      {clinicalItems.length > 0 ? (
        <div className="context-block">
          <p className="context-block-label">Contexto clinico ativo</p>
          <div className="context-chip-list">
            {clinicalItems.map((item) => (
              <span key={item} className="context-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {operationalItems.length > 0 ? (
        <div className="context-block">
          <p className="context-block-label">Contexto operacional</p>
          <div className="context-chip-list">
            {operationalItems.map((item) => (
              <span key={item} className="context-chip context-chip-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {hasNotes ? (
        <div className="context-block">
          <p className="context-block-label">Notas livres</p>
          <p className="support-text context-notes">{sessionContext.notes}</p>
        </div>
      ) : null}
    </section>
  )
}

export default SessionContextSummaryCard
