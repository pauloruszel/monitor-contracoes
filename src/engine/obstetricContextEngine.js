import { getActionAdjustmentReasons, getReadingAdjustmentReasons } from '../utils/sessionContextUtils'
import { OBSTETRIC_CONTEXT_ADJUSTMENTS } from '../content/clinicalCopy'

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
    result.patternLabel = OBSTETRIC_CONTEXT_ADJUSTMENTS.patternLabelShortening
  }

  if (pattern.key === 'latente' && intervalTrend === 'spacing') {
    result.patternLabel = OBSTETRIC_CONTEXT_ADJUSTMENTS.patternLabelSpacing
  }

  result.description = appendContext(result.description, [
    intervalTrend === 'shortening' ? OBSTETRIC_CONTEXT_ADJUSTMENTS.intervalShortening : '',
    durationTrend === 'increasing' ? OBSTETRIC_CONTEXT_ADJUSTMENTS.durationIncreasing : '',
    regularity === 'regular' ? OBSTETRIC_CONTEXT_ADJUSTMENTS.patternRegular : '',
    userProfile?.priorFastLabor ? OBSTETRIC_CONTEXT_ADJUSTMENTS.priorFastLaborWarning : '',
    clinicalPreferences?.alertSensitivity === 'high'
      ? OBSTETRIC_CONTEXT_ADJUSTMENTS.highAlertSensitivity
      : '',
    sessionContext?.longTravelToHospital ? OBSTETRIC_CONTEXT_ADJUSTMENTS.longTravelToHospital : '',
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
