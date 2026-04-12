import React from 'react'

function UserProfileCardV2({ userProfile, onChangeProfile }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Perfil da gestação</h2>
          <p className="support-text compact-text">
            Essas informações podem mudar a interpretação da evolução e aparecem para a doula.
          </p>
        </div>
        <span className="badge badge-muted">Perfil</span>
      </div>

      <div className="field-checkbox-group">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={userProfile.firstPregnancy}
            onChange={(event) => onChangeProfile('firstPregnancy', event.target.checked)}
          />
          <span>Primeira gestação</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={userProfile.priorFastLabor}
            onChange={(event) => onChangeProfile('priorFastLabor', event.target.checked)}
          />
          <span>Já teve parto anterior rápido</span>
        </label>
      </div>

      <label className="field">
        <span>Semanas gestacionais</span>
        <input
          type="number"
          min="0"
          max="45"
          inputMode="numeric"
          placeholder="Ex.: 39"
          value={userProfile.gestationalWeeks}
          onChange={(event) => onChangeProfile('gestationalWeeks', event.target.value)}
        />
      </label>
    </section>
  )
}

export default UserProfileCardV2
