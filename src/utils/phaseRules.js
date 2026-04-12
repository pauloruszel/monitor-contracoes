import { CARE_RECOMMENDATIONS, buildCarePlan } from '../engine/carePlanEngine'
import { applyObstetricContext } from '../engine/obstetricContextEngine'
import {
  TEMPORAL_PATTERNS,
  evaluateTemporalPattern,
  getIrregularity,
} from '../engine/temporalPatternEngine'

export const PHASES = TEMPORAL_PATTERNS
export const RECOMMENDATIONS = CARE_RECOMMENDATIONS

export function evaluateAlertRules() {
  return null
}

export function evaluateProfileAdjustments({
  phaseResult,
  trendSummary,
  userProfile,
  clinicalPreferences,
  sessionContext,
  wellbeingSummary,
}) {
  const pattern = applyObstetricContext({
    pattern: phaseResult,
    trendSummary,
    userProfile,
    clinicalPreferences,
    sessionContext,
    wellbeingSummary,
  })

  return {
    ...pattern,
    adjustmentReasons: pattern.readingAdjustmentReasons,
  }
}

export function evaluatePhaseRules({ contractions, intervals, averageDuration, averageInterval }) {
  return evaluateTemporalPattern({ contractions, intervals, averageDuration, averageInterval })
}

export function buildRecommendation({ phaseKey, trendSummary, userProfile, clinicalPreferences }) {
  const carePlan = buildCarePlan({
    patternKey: phaseKey,
    trendSummary,
    userProfile,
    clinicalPreferences,
  })

  return {
    title: carePlan.action,
    message: carePlan.observation,
    secondary: carePlan.interpretation,
    alertMessage: carePlan.alertMessage,
  }
}

export function getPhaseFromMetrics(input) {
  const alertOverride = evaluateAlertRules(input)

  if (alertOverride) {
    return alertOverride
  }

  const phaseResult = evaluatePhaseRules(input)

  return evaluateProfileAdjustments({
    ...input,
    phaseResult,
  })
}

export function getRecommendationFromPhase(phaseKey, context = {}) {
  return buildRecommendation({ phaseKey, ...context })
}

export { getIrregularity }
