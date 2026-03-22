import React from 'react'

function CurrentContractionCard({
  activeContraction,
  currentDuration,
  onStart,
  onEnd,
  onWellbeingChange,
  formatClockTime,
  formatDuration,
}) {
  return (
    <section className="card card-primary">
      <div className="card-header">
        <h2>Contração atual</h2>
        <span className={`badge ${activeContraction ? 'badge-live' : 'badge-muted'}`}>
          {activeContraction ? 'Em andamento' : 'Aguardando'}
        </span>
      </div>
      <div className="current-timer">{formatDuration(currentDuration)}</div>
      <p className="support-text">
        {activeContraction
          ? `Iniciada às ${formatClockTime(activeContraction.start)}`
          : 'Toque em iniciar quando a contração começar.'}
      </p>
      {activeContraction ? (
        <div className="wellbeing-picker">
          <span>Como ela está agora</span>
          <div className="wellbeing-options">
            <button
              className={`wellbeing-button ${
                activeContraction.wellbeing === 'green' ? 'wellbeing-green active' : 'wellbeing-green'
              }`}
              onClick={() => onWellbeingChange('green')}
              type="button"
            >
              Bem
            </button>
            <button
              className={`wellbeing-button ${
                activeContraction.wellbeing === 'yellow'
                  ? 'wellbeing-yellow active'
                  : 'wellbeing-yellow'
              }`}
              onClick={() => onWellbeingChange('yellow')}
              type="button"
            >
              Mais desconfortável
            </button>
            <button
              className={`wellbeing-button ${
                activeContraction.wellbeing === 'red' ? 'wellbeing-red active' : 'wellbeing-red'
              }`}
              onClick={() => onWellbeingChange('red')}
              type="button"
            >
              Muita dor
            </button>
          </div>
        </div>
      ) : null}
      <div className="action-row">
        <button className="button button-start" onClick={onStart} disabled={Boolean(activeContraction)}>
          Iniciar contração
        </button>
        <button className="button button-stop" onClick={onEnd} disabled={!activeContraction}>
          Encerrar contração
        </button>
      </div>
    </section>
  )
}

export default CurrentContractionCard
