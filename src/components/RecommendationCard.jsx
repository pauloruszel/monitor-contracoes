import React from 'react'

function RecommendationCard({ phase, recommendation, urgency, wellbeingSummary }) {
  return (
    <section className={`card recommendation recommendation-${urgency}`}>
      <div className="card-header">
        <div>
          <h2>Agora</h2>
          <p className="inline-phase-label">{phase.label}</p>
        </div>
        <span className={`badge badge-${urgency}`}>{recommendation.title}</span>
      </div>
      <p className="recommendation-main">{recommendation.message}</p>
      <p className={`wellbeing-note wellbeing-${wellbeingSummary.dominant}`}>
        Conforto recente: {wellbeingSummary.label}
      </p>
      <p className="support-text">{recommendation.secondary}</p>
    </section>
  )
}

export default RecommendationCard
