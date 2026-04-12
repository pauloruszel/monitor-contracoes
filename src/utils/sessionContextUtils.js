import { SESSION_CONTEXT_COPY } from '../content/contextCopy'
import { defaultSessionContext } from './storage'

export function normalizeSessionContext(sessionContext) {
  return {
    ...defaultSessionContext,
    ...(sessionContext || {}),
    notes: sessionContext?.notes || '',
  }
}

export function getActiveSessionContextItems(sessionContext) {
  const context = normalizeSessionContext(sessionContext)
  const items = []

  if (context.homeObservationGuidance) {
    items.push(SESSION_CONTEXT_COPY.activeItems.homeObservationGuidance)
  }

  if (context.longTravelToHospital) {
    items.push(SESSION_CONTEXT_COPY.activeItems.longTravelToHospital)
  }

  if (context.bagReady) {
    items.push(SESSION_CONTEXT_COPY.activeItems.bagReady)
  }

  return items
}

export function getClinicalContextItems({ userProfile, clinicalPreferences }) {
  const items = []

  if (userProfile?.priorFastLabor) {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.priorFastLabor)
  }

  if (userProfile?.firstPregnancy) {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.firstPregnancy)
  }

  if (userProfile?.gestationalWeeks) {
    items.push(`${userProfile.gestationalWeeks} semanas`)
  }

  if (clinicalPreferences?.notifyDoulaEarly) {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.notifyDoulaEarly)
  }

  if (clinicalPreferences?.useFiveOneOne) {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.useFiveOneOne)
  }

  if (clinicalPreferences?.alertSensitivity === 'high') {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.alertSensitivityHigh)
  }

  if (clinicalPreferences?.alertSensitivity === 'low') {
    items.push(SESSION_CONTEXT_COPY.clinicalItems.alertSensitivityLow)
  }

  return items
}

export function getReadingAdjustmentReasons({
  patternKey,
  trendSummary,
  userProfile,
  clinicalPreferences,
  sessionContext,
}) {
  const reasons = []

  if (userProfile?.priorFastLabor) {
    reasons.push(SESSION_CONTEXT_COPY.adjustmentReasons.priorFastLabor)
  }

  if (clinicalPreferences?.alertSensitivity === 'high') {
    reasons.push(SESSION_CONTEXT_COPY.adjustmentReasons.alertSensitivityHigh)
  }

  if (sessionContext?.longTravelToHospital && patternKey !== 'transicao') {
    reasons.push(SESSION_CONTEXT_COPY.adjustmentReasons.longTravelToHospital)
  }

  return reasons
}

export function getActionAdjustmentReasons({
  patternKey,
  trendSummary,
  userProfile,
  clinicalPreferences,
  wellbeingSummary,
}) {
  const reasons = []

  if (
    patternKey === 'prodomos' &&
    clinicalPreferences?.notifyDoulaEarly &&
    trendSummary?.intervalTrend?.label === 'shortening'
  ) {
    reasons.push(SESSION_CONTEXT_COPY.adjustmentReasons.notifyDoulaEarly)
  }

  if (userProfile?.priorFastLabor) {
    reasons.push(SESSION_CONTEXT_COPY.adjustmentReasons.priorFastLabor)
  }

  if (wellbeingSummary?.dominant === 'red') {
    reasons.push('muita dor recente')
  }

  return reasons
}

export function getAdjustmentReasons(args) {
  return getReadingAdjustmentReasons({
    patternKey: args.phaseKey || args.patternKey,
    trendSummary: args.trendSummary,
    userProfile: args.userProfile,
    clinicalPreferences: args.clinicalPreferences,
    sessionContext: args.sessionContext,
  })
}

export function formatAdjustmentCopy(reasons) {
  if (!reasons || reasons.length === 0) return ''
  if (reasons.length === 1) return `Esta leitura foi ajustada por ${reasons[0]}.`
  if (reasons.length === 2) return `Esta leitura foi ajustada por ${reasons[0]} e ${reasons[1]}.`

  return `Esta leitura foi ajustada por ${reasons.slice(0, -1).join(', ')} e ${reasons.at(-1)}.`
}
