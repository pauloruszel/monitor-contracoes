import React from 'react'

function buildPrimaryReason({ warningAssessment, trendSummary, phase }) {
  if (warningAssessment.level === 'critical') {
    return 'Há sinal de alerta com prioridade imediata.'
  }

  if (warningAssessment.level === 'warning') {
    return 'Há sinal de alerta ativo e ele vem antes da análise do ritmo.'
  }

  if (trendSummary?.summaryLabel) {
    return trendSummary.summaryLabel
  }

  if (phase.patternLabel) {
    return phase.patternLabel
  }

  return 'Ainda há poucos dados para um padrão mais claro.'
}

function buildMetricLine({ metrics, formatDuration }) {
  const details = []

  if (metrics.averageInterval) {
    details.push(`Intervalo médio ${formatDuration(metrics.averageInterval)}`)
  }

  if (metrics.averageDuration) {
    details.push(`duração ${formatDuration(metrics.averageDuration)}`)
  }

  return details.join(' • ')
}

function buildActionCopy({ recommendation }) {
  return recommendation.title
}

function getUrgencyLabel(urgency) {
  if (urgency === 'critical') return 'Ação imediata'
  if (urgency === 'warning') return 'Atenção alta'
  if (urgency === 'attention') return 'Acompanhar de perto'
  return 'Situação atual'
}

function DecisionCard({
  phase,
  recommendation,
  warningAssessment,
  urgency,
  trendSummary,
  metrics,
  formatDuration,
  adjustmentCopy = '',
}) {
  const primaryReason = buildPrimaryReason({
    warningAssessment,
    trendSummary,
    phase,
  })
  const metricLine = buildMetricLine({ metrics, formatDuration })
  const actionCopy = buildActionCopy({ recommendation })
  const isCritical = urgency === 'critical'
  const cardClassName = [
    'card',
    'decision-card',
    'decision-card-sticky',
    `decision-card-${urgency}`,
    urgency === 'critical' ? 'decision-card-expanded' : 'decision-card-compact',
  ].join(' ')

  return (
    <section className={cardClassName}>
      <div className="decision-card-topline">
        <p className="decision-eyebrow">Leitura atual</p>
        <span className={`badge badge-${urgency}`}>{recommendation.title}</span>
      </div>

      {isCritical ? (
        <div className="decision-alert-banner" role="alert">
          {getUrgencyLabel(urgency)}
        </div>
      ) : null}

      <div className="decision-card-header">
        <div>
          <p className="inline-phase-label">Fase provável</p>
          <h2>{phase.label}</h2>
        </div>
      </div>

      <div className="decision-card-body">
        <p className="decision-action-label">Conduta sugerida</p>
        <p className="decision-action">{actionCopy}</p>
        {adjustmentCopy ? <p className="decision-adjustment">{adjustmentCopy}</p> : null}
        <p className="decision-why">{primaryReason}</p>
        {metricLine ? <p className="decision-metrics">{metricLine}</p> : null}
      </div>
    </section>
  )
}

export default DecisionCard
