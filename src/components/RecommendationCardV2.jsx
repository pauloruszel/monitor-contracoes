import React from 'react'

function RecommendationCardV2({
  phase,
  recommendation,
  urgency,
  wellbeingSummary,
  trendSummary = null,
  mode = 'monitor',
  meta = null,
}) {
  const viewModel = getNowCardViewModel(phase.key, recommendation, mode, meta)

  return (
    <section className={`card recommendation recommendation-${urgency}`}>
      <div className="card-header">
        <div>
          <h2>Agora</h2>
          <p className="inline-phase-label">{viewModel.phaseLabel}</p>
          <h3 className="now-phase-title">{phase.label}</h3>
        </div>
        <span className={`badge badge-${urgency}`}>{recommendation.title}</span>
      </div>
      <div className="now-action-block">
        <p className="now-action-label">{viewModel.actionLabel}</p>
        <p className="recommendation-main">{viewModel.action}</p>
        <p className="now-summary">{viewModel.summary}</p>
      </div>
      <div className="now-support-block">
        <p className={`wellbeing-note wellbeing-${wellbeingSummary.dominant}`}>
          {viewModel.wellbeingLabel}: {wellbeingSummary.label}
        </p>
        {trendSummary ? <p className="support-text now-trend-text">{trendSummary.summaryLabel}</p> : null}
        <p className="support-text now-support-text">{viewModel.support}</p>
        {viewModel.metaText ? <p className="support-text now-meta-text">{viewModel.metaText}</p> : null}
      </div>
    </section>
  )
}

function getNowCardViewModel(phaseKey, recommendation, mode, meta) {
  const base = {
    phaseLabel: mode === 'doula' ? 'Leitura atual' : 'Fase provável',
    actionLabel: mode === 'doula' ? 'Conduta sugerida' : 'O que fazer agora',
    wellbeingLabel: mode === 'doula' ? 'Como ela está' : 'Como ela está agora',
    metaText:
      mode === 'doula' && meta
        ? `Última atualização: ${meta.lastUpdated}. ${meta.sessionStatus}`
        : '',
  }

  switch (phaseKey) {
    case 'latente':
      return {
        ...base,
        action: recommendation.title,
        summary: 'As contrações estão mais frequentes e vale acompanhar de perto.',
        support: 'Ela pode continuar se hidratando e descansando entre as contrações.',
      }
    case 'ativa':
      return {
        ...base,
        action: recommendation.title,
        summary: 'As contrações parecem mais fortes e mais próximas.',
        support: 'Separem documentos, bolsa e deixem a saída pronta com calma.',
      }
    case 'transicao':
      return {
        ...base,
        action: recommendation.title,
        summary: 'Os intervalos estão muito curtos e a situação exige mais urgência.',
        support: 'Procurem atendimento agora. O app não substitui avaliação profissional.',
      }
    default:
      return {
        ...base,
        action: recommendation.title,
        summary: 'Ainda parece começo. Sigam com calma e continuem observando.',
        support: 'Ela pode se hidratar, se alimentar e descansar.',
      }
  }
}

export default RecommendationCardV2
