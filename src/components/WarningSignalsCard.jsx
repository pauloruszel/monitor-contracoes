import React from 'react'

const signalOptions = [
  {
    key: 'mucusPlug',
    label: 'Perdeu o tampão',
    helper: 'Gosma gelatinosa, amarelada, rosada ou com um pouco de sangue.',
  },
  {
    key: 'watersBroken',
    label: 'Bolsa rompeu',
    helper: 'Saiu líquido pela vagina de forma contínua ou em quantidade relevante.',
  },
  {
    key: 'meconium',
    label: 'Líquido verde ou marrom',
    helper: 'Pode sugerir mecônio e precisa de avaliação rápida.',
  },
  {
    key: 'reducedMovement',
    label: 'Menos movimentos do bebê',
    helper: 'Movimentos reduzidos ou percepção de que o bebê está mexendo menos.',
  },
  {
    key: 'bleeding',
    label: 'Sangramento',
    helper: 'Sangramento mais importante que apenas traços no tampão.',
  },
  {
    key: 'badSmellOrFever',
    label: 'Cheiro ruim ou febre',
    helper: 'Cheiro forte no líquido, febre ou mal-estar.',
  },
  {
    key: 'preterm',
    label: 'Menos de 37 semanas',
    helper: 'Marque se ainda não completou 37 semanas de gestação.',
  },
]

function WarningSignalsCard({ signals, onToggleSignal, assessment, open, onToggleOpen, readOnly = false }) {
  return (
    <section className={`card warning-card warning-card-${assessment.level}`}>
      <div className="card-header">
        <div>
          <h2>Sinais de alerta</h2>
          <p className="support-text compact-text">{assessment.message}</p>
        </div>
        <span className={`badge badge-${assessment.level}`}>{assessment.title}</span>
      </div>

      {!readOnly ? (
        <div className="collapsible-toggle-row">
          <button className="button button-secondary" onClick={onToggleOpen} type="button">
            {open ? 'Ocultar sinais' : 'Ver sinais de alerta'}
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="warning-signals-chips">
          {signalOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`signal-chip ${signals[option.key] ? 'signal-chip-active' : ''} ${
                readOnly ? 'signal-chip-readonly' : ''
              }`}
              onClick={() => {
                if (!readOnly) onToggleSignal(option.key)
              }}
              title={option.helper}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default WarningSignalsCard
