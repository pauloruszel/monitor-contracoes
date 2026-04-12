import React from 'react'

function ClinicalPreferencesCardV2({ clinicalPreferences, onChangePreference }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Preferências clínicas</h2>
          <p className="support-text compact-text">
            Esses ajustes deixam a leitura mais conservadora quando ativados e também aparecem para a doula.
          </p>
        </div>
        <span className="badge badge-muted">Preferências</span>
      </div>

      <div className="field-checkbox-group">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={clinicalPreferences.useFiveOneOne}
            onChange={(event) => onChangePreference('useFiveOneOne', event.target.checked)}
          />
          <span>Usar referência 5-1-1 como apoio de leitura</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={clinicalPreferences.notifyDoulaEarly}
            onChange={(event) => onChangePreference('notifyDoulaEarly', event.target.checked)}
          />
          <span>Preferir aviso mais cedo para a doula</span>
        </label>
      </div>

      <label className="field">
        <span>Sensibilidade de alerta</span>
        <select
          className="select-field"
          value={clinicalPreferences.alertSensitivity}
          onChange={(event) => onChangePreference('alertSensitivity', event.target.value)}
        >
          <option value="low">Baixa</option>
          <option value="standard">Padrão</option>
          <option value="high">Alta</option>
        </select>
      </label>
    </section>
  )
}

export default ClinicalPreferencesCardV2
