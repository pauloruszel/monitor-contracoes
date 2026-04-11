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
  const isActive = Boolean(activeContraction)

  return (
    <section className="card card-primary action-card">
      <div className="action-card-topline">
        <div className="card-header">
          <h2>Contração atual</h2>
          <span className={`badge ${isActive ? 'badge-live' : 'badge-muted'}`}>
            {isActive ? 'Em andamento' : 'Aguardando'}
          </span>
        </div>
        <p className="support-text action-support-text">
          {isActive
            ? `Iniciada às ${formatClockTime(activeContraction.start)}`
            : 'Use o botão principal assim que a contração começar.'}
        </p>
      </div>

      <div className="action-primary-block">
        <div className="current-timer">{formatDuration(currentDuration)}</div>
        <button
          className={`button action-main-button ${isActive ? 'button-stop' : 'button-start'}`}
          onClick={isActive ? onEnd : onStart}
          type="button"
        >
          {isActive ? 'Encerrar contração' : 'Iniciar contração'}
        </button>
      </div>

      <div className="action-secondary-row">
        <button
          className="button button-secondary action-secondary-button"
          onClick={onStart}
          disabled={isActive}
          type="button"
        >
          Iniciar
        </button>
        <button
          className="button button-secondary action-secondary-button"
          onClick={onEnd}
          disabled={!isActive}
          type="button"
        >
          Encerrar
        </button>
      </div>

      <div className="wellbeing-picker wellbeing-picker-always">
        <span>Como ela está agora</span>
        <p className="support-text wellbeing-help-text">
          Atualize o bem-estar durante a contração. Fora dela, este bloco fica visível, mas inativo.
        </p>
        <div className="wellbeing-options">
          <button
            className={`wellbeing-button ${
              activeContraction?.wellbeing === 'green' ? 'wellbeing-green active' : 'wellbeing-green'
            }`}
            onClick={() => onWellbeingChange('green')}
            type="button"
            disabled={!isActive}
          >
            Bem
          </button>
          <button
            className={`wellbeing-button ${
              activeContraction?.wellbeing === 'yellow'
                ? 'wellbeing-yellow active'
                : 'wellbeing-yellow'
            }`}
            onClick={() => onWellbeingChange('yellow')}
            type="button"
            disabled={!isActive}
          >
            Mais desconfortável
          </button>
          <button
            className={`wellbeing-button ${
              activeContraction?.wellbeing === 'red' ? 'wellbeing-red active' : 'wellbeing-red'
            }`}
            onClick={() => onWellbeingChange('red')}
            type="button"
            disabled={!isActive}
          >
            Muita dor
          </button>
        </div>
      </div>
    </section>
  )
}

export default CurrentContractionCard
