import { CLINICAL_PATTERN_COPY, STRONG_PATTERN_LIMITATION } from '../content/clinicalCopy'

export const CARE_RECOMMENDATIONS = {
  prodomos: CLINICAL_PATTERN_COPY.prodomos.recommendation,
  latente: CLINICAL_PATTERN_COPY.latente.recommendation,
  ativa: CLINICAL_PATTERN_COPY.ativa.recommendation,
  transicao: CLINICAL_PATTERN_COPY.transicao.recommendation,
}

function appendContext(text, additions) {
  const extras = additions.filter(Boolean)
  if (extras.length === 0) return text
  return `${text} ${extras.join(' ')}`
}

export function buildCarePlan({ patternKey, trendSummary, userProfile, clinicalPreferences }) {
  const base = { ...(CARE_RECOMMENDATIONS[patternKey] || CARE_RECOMMENDATIONS.prodomos) }
  const intervalTrend = trendSummary?.intervalTrend?.label || ''

  if (
    patternKey === 'prodomos' &&
    clinicalPreferences?.notifyDoulaEarly &&
    intervalTrend === 'shortening'
  ) {
    base.title = 'Avisar a doula cedo'
    base.message =
      'O padrao ainda parece inicial, mas vale avisar a doula mais cedo e seguir observando.'
    base.alertMessage = 'Padrao inicial encurtando. Avisar a doula cedo.'
  }

  const interpretation = appendContext(base.secondary, [
    intervalTrend === 'shortening' ? 'O padrao recente esta encurtando.' : '',
    intervalTrend === 'spacing' ? 'O padrao recente esta mais espacado.' : '',
    clinicalPreferences?.useFiveOneOne && patternKey === 'latente'
      ? 'Observe se o padrao se aproxima do criterio 5-1-1.'
      : '',
    userProfile?.priorFastLabor ? 'Como houve parto rapido anterior, mantenham atencao extra.' : '',
  ])

  return {
    action: base.title,
    observation: base.message,
    interpretation,
    limitation:
      patternKey === 'ativa' || patternKey === 'transicao' ? STRONG_PATTERN_LIMITATION : '',
    alertMessage: base.alertMessage,
  }
}
