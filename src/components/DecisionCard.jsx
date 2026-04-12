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

      <div className="decision-card-body">
        <div className="decision-primary-block">
          <p className="decision-action-label">{viewModel.actionLabel}</p>
          <p className="decision-action">{viewModel.actionTitle}</p>
        </div>

        <div className="decision-reading-block">
          <p className="inline-phase-label">{viewModel.readingLabel}</p>
          <h2>{viewModel.readingTitle}</h2>
        </div>
        {viewModel.adjustmentCopy ? <p className="decision-adjustment">{viewModel.adjustmentCopy}</p> : null}

        <div className="decision-support-block">
          <div className="decision-reason-block">
            <p className="decision-meta-label">{viewModel.reasonLabel}</p>
            <p className="decision-summary">{viewModel.reasonLine}</p>
          </div>
        </div>

        {viewModel.metricLine || viewModel.limitation ? (
          <div className="decision-footer-block">
            {viewModel.metricLine ? <p className="decision-metrics">{viewModel.metricLine}</p> : null}
            {viewModel.limitation ? <p className="decision-limitation">{viewModel.limitation}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default DecisionCard
