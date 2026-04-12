import React from 'react'

function SessionContextFormCard({ sessionContext, onChangeContext }) {
  return (
    <section className="card session-notes-card-wide">
      <div className="card-header">
        <div>
          <h2>Observações da sessão</h2>
          <p className="support-text compact-text">
            Marque o contexto recorrente aqui e use as notas livres só para o que fugir do padrão.
          </p>
        </div>
        <span className="badge badge-muted">Contexto</span>
      </div>

      <div className="field-checkbox-group">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={sessionContext.homeObservationGuidance}
            onChange={(event) => onChangeContext('homeObservationGuidance', event.target.checked)}
          />
          <span>Equipe orientou observar em casa por enquanto</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={sessionContext.longTravelToHospital}
            onChange={(event) => onChangeContext('longTravelToHospital', event.target.checked)}
          />
          <span>Deslocamento longo até o hospital</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={sessionContext.bagReady}
            onChange={(event) => onChangeContext('bagReady', event.target.checked)}
          />
          <span>Bolsa e documentos já separados</span>
        </label>
      </div>

      <label className="field">
        <span>Notas livres da sessão</span>
        <textarea
          className="textarea-field"
          placeholder="Ex.: teste de observação, preferência da equipe, algo que a doula precisa saber e não cabe nos campos acima."
          value={sessionContext.notes}
          onChange={(event) => onChangeContext('notes', event.target.value)}
          rows={5}
        />
      </label>
    </section>
  )
}

export default SessionContextFormCard
