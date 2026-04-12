import { DECISION_COPY, DECISION_ENGINE_VERSION, DECISION_PRECEDENCE } from '../content/decisionCopy'
import { buildDecisionInput } from './decisionInput'
import { evaluateWarningSignals } from './warningSignalEngine'
import { buildCarePlan } from './carePlanEngine'
import { applyObstetricContext } from './obstetricContextEngine'
import { evaluateTemporalPattern } from './temporalPatternEngine'

function resolvePrecedence(context) {
  return DECISION_PRECEDENCE.find((rule) => rule.matches(context)) || DECISION_PRECEDENCE.at(-1)
}

function buildActionPlan({ precedence, warningSignal, carePlan }) {
  if (precedence.key === 'warning_signal_critical' || precedence.key === 'warning_signal_warning') {
    return {
      action: warningSignal.title,
      observation: warningSignal.message,
      interpretation: DECISION_COPY.precedence.warningSignal.interpretation,
      limitation: '',
      alertMessage: warningSignal.message,
    }
  }

  if (precedence.key === 'wellbeing_severe') {
    return {
      ...carePlan,
      interpretation: DECISION_COPY.precedence.wellbeing.severe.interpretation,
    }
  }

  if (precedence.key === 'wellbeing_attention') {
    return {
      ...carePlan,
      interpretation: DECISION_COPY.precedence.wellbeing.attention.interpretation,
    }
  }

  return carePlan
}

export function getSessionDecision(rawInput) {
  const input = buildDecisionInput(rawInput)
  const {
    temporalInput,
    warningSignals,
    sessionContext,
    userProfile,
    clinicalPreferences,
    wellbeingSummary,
  } = input

  const temporalPattern = evaluateTemporalPattern(temporalInput)
  const pattern = applyObstetricContext({
    pattern: temporalPattern,
    trendSummary: temporalInput.trendSummary,
    userProfile,
    clinicalPreferences,
    sessionContext,
    wellbeingSummary,
  })
  const warningSignal = evaluateWarningSignals(warningSignals)
  const carePlan = buildCarePlan({
    patternKey: pattern.key,
    trendSummary: temporalInput.trendSummary,
    userProfile,
    clinicalPreferences,
  })
  const precedence = resolvePrecedence({ warningSignal, wellbeingSummary, pattern })
  const actionPlan = buildActionPlan({ precedence, warningSignal, carePlan })

  const urgency =
    warningSignal.level === 'critical'
      ? 'critical'
      : warningSignal.level === 'warning'
        ? 'warning'
        : pattern.urgency

  return {
    version: DECISION_ENGINE_VERSION,
    input,
    pattern,
    temporalPattern,
    warningSignal,
    actionPlan,
    readingAdjustmentReasons: pattern.readingAdjustmentReasons || [],
    actionAdjustmentReasons: pattern.actionAdjustmentReasons || [],
    decision: {
      precedenceKey: precedence.key,
      priority: precedence.priority,
      urgency,
    },
  }
}
