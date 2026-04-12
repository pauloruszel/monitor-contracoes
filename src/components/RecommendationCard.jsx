import React from 'react'

function RecommendationCard({ phase, recommendation, urgency, wellbeingSummary }) {
  const viewModel = getNowCardViewModel(phase.key, recommendation)

  return (
    <section className={`card recommendation recommendation-${urgency}`}>
      <div className="card-header">
        <div>
          <h2>Agora</h2>
          <p className="inline-phase-label">Leitura do padrão</p>
          <h3 className="now-phase-title">{phase.label}</h3>
        </div>
        <span className={`badge badge-${urgency}`}>{recommendation.title}</span>
      </div>
      <div className="now-action-block">
        <p className="now-action-label">O que fazer agora</p>
        <p className="recommendation-main">{viewModel.action}</p>
        <p className="now-summary">{viewModel.summary}</p>
      </div>
      <div className="now-support-block">
        <p className={`wellbeing-note wellbeing-${wellbeingSummary.dominant}`}>
          Como ela está agora: {wellbeingSummary.label}
        </p>
        <p className="support-text now-support-text">{viewModel.support}</p>
      </div>
    </section>
  )
}

function getNowCardViewModel(phaseKey, recommendation) {
  switch (phaseKey) {
    case 'latente':
      return {
        action: recommendation.title,
        summary: 'As contrações estão mais frequentes e vale acompanhar de perto.',
        support: 'Ela pode continuar se hidratando e descansando entre as contrações.',
      }
    case 'ativa':
      return {
        action: recommendation.title,
        summary: 'As contrações parecem mais fortes e mais próximas.',
        support: 'Separem documentos, bolsa e deixem a saída pronta com calma.',
      }
    case 'transicao':
      return {
        action: recommendation.title,
        summary: 'Os intervalos estão muito curtos e a situação exige mais urgência.',
        support: 'Procurem atendimento agora. O app não substitui avaliação profissional.',
      }
    default:
      return {
        action: recommendation.title,
        summary: 'Ainda parece começo. Sigam com calma e continuem observando.',
        support: 'Ela pode se hidratar, se alimentar e descansar.',
      }
  }
}

export default RecommendationCard
