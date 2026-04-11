import React from 'react'

function SessionNotesCard({ sessionNotes, onChangeNotes }) {
  return (
    <section className="card session-notes-card-wide">
      <div className="card-header">
        <div>
          <h2>Observações da sessão</h2>
          <p className="support-text compact-text">
            Registre contexto livre que pode ajudar na leitura da evolução.
          </p>
        </div>
        <span className="badge badge-muted">Contexto</span>
      </div>
      <label className="field">
        <span>Anotações rápidas</span>
        <textarea
          className="textarea-field"
          placeholder="Ex.: dor lombar, exaustão, orientação da doula, bolsa rota percebida..."
          value={sessionNotes}
          onChange={(event) => onChangeNotes(event.target.value)}
          rows={5}
        />
      </label>
    </section>
  )
}

export default SessionNotesCard
