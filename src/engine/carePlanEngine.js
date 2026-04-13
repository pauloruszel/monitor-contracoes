import {
  CARE_PLAN_ADJUSTMENTS,
  CLINICAL_PATTERN_COPY,
  STRONG_PATTERN_LIMITATION,
} from '../content/clinicalCopy'

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
    base.title = CARE_PLAN_ADJUSTMENTS.notifyDoulaEarlyTitle
    base.message = CARE_PLAN_ADJUSTMENTS.notifyDoulaEarlyMessage
    base.alertMessage = CARE_PLAN_ADJUSTMENTS.notifyDoulaEarlyAlert
  }

  const interpretation = appendContext(base.secondary, [
    intervalTrend === 'shortening' ? CARE_PLAN_ADJUSTMENTS.intervalShortening : '',
    intervalTrend === 'spacing' ? CARE_PLAN_ADJUSTMENTS.intervalSpacing : '',
    clinicalPreferences?.useFiveOneOne && patternKey === 'latente'
      ? CARE_PLAN_ADJUSTMENTS.fiveOneOneHint
      : '',
    userProfile?.priorFastLabor ? CARE_PLAN_ADJUSTMENTS.priorFastLaborHint : '',
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
