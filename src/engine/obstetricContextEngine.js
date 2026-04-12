import { getActionAdjustmentReasons, getReadingAdjustmentReasons } from '../utils/sessionContextUtils'

function appendContext(text, additions) {
  const extras = additions.filter(Boolean)
  if (extras.length === 0) return text
  return `${text} ${extras.join(' ')}`
}

export function applyObstetricContext({
  pattern,
  trendSummary,
  userProfile,
  clinicalPreferences,
  sessionContext,
  wellbeingSummary,
}) {
  const result = { ...pattern }
  const intervalTrend = trendSummary?.intervalTrend?.label || ''
  const durationTrend = trendSummary?.durationTrend?.label || ''
  const regularity = trendSummary?.regularity?.label || ''

  if (pattern.key === 'prodomos' && intervalTrend === 'shortening') {
    result.patternLabel = 'Padrao encurtando'
  }

  if (pattern.key === 'latente' && intervalTrend === 'spacing') {
    result.patternLabel = 'Padrao espacando'
  }

  result.description = appendContext(result.description, [
    intervalTrend === 'shortening' ? 'A janela recente sugere intervalos encurtando.' : '',
    durationTrend === 'increasing' ? 'A duracao media tambem esta aumentando.' : '',
    regularity === 'regular' ? 'O padrao esta mais consistente.' : '',
    userProfile?.priorFastLabor ? 'Como ja houve parto rapido, vale observar com atencao extra.' : '',
    clinicalPreferences?.alertSensitivity === 'high'
      ? 'A sensibilidade de alerta esta configurada para acompanhar mudancas mais cedo.'
      : '',
    sessionContext?.longTravelToHospital ? 'Ha deslocamento longo ate o hospital.' : '',
  ])

  return {
    ...result,
    readingAdjustmentReasons: getReadingAdjustmentReasons({
      patternKey: pattern.key,
      trendSummary,
      userProfile,
      clinicalPreferences,
      sessionContext,
    }),
    actionAdjustmentReasons: getActionAdjustmentReasons({
      patternKey: pattern.key,
      trendSummary,
      userProfile,
      clinicalPreferences,
      wellbeingSummary,
    }),
  }
}
