import React from 'react'

function DecisionCard({ viewModel }) {
  const cardClassName = [
    'card',
    'decision-card',
    'decision-card-sticky',
    `decision-card-${viewModel.urgency}`,
    viewModel.isCritical ? 'decision-card-expanded' : 'decision-card-compact',
  ].join(' ')

  return (
    <section className={cardClassName}>
      <div className="decision-card-topline">
        <p className="decision-eyebrow">{viewModel.eyebrow}</p>
        <span className={`badge badge-${viewModel.urgency}`}>{viewModel.badgeLabel}</span>
      </div>

      {viewModel.isCritical ? (
        <div className="decision-alert-banner" role="alert">
          {viewModel.urgencyLabel}
        </div>
      ) : null}

      <div className="decision-card-header">
        <div>
          <p className="inline-phase-label">{viewModel.readingLabel}</p>
          <h2>{viewModel.readingTitle}</h2>
        </div>
      </div>

      <div className="decision-card-body">
        <p className="decision-action-label">{viewModel.actionLabel}</p>
        <p className="decision-action">{viewModel.actionTitle}</p>
        {viewModel.adjustmentCopy ? <p className="decision-adjustment">{viewModel.adjustmentCopy}</p> : null}
        <p className="decision-why">{viewModel.primaryReason}</p>
        <p className="decision-why">{viewModel.observation}</p>
        <p className="decision-why">{viewModel.interpretation}</p>
        {viewModel.limitation ? <p className="decision-adjustment">{viewModel.limitation}</p> : null}
        {viewModel.metricLine ? <p className="decision-metrics">{viewModel.metricLine}</p> : null}
      </div>
    </section>
  )
}

export default DecisionCard
