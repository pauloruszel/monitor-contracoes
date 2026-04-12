import { DECISION_COPY } from '../content/decisionCopy'
import { formatAdjustmentCopy } from '../utils/sessionContextUtils'

function getUrgencyLabel(urgency) {
  if (urgency === 'critical') return DECISION_COPY.ui.urgentAction
  if (urgency === 'warning') return DECISION_COPY.ui.highAttention
  if (urgency === 'attention') return DECISION_COPY.ui.closeFollowUp
  return DECISION_COPY.ui.currentSituation
}

function normalizeCopy(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function isDistinctCopy(candidate, references) {
  const normalizedCandidate = normalizeCopy(candidate)
  if (!normalizedCandidate) return false

  return references.every((reference) => normalizeCopy(reference) !== normalizedCandidate)
}

function buildReasonLine({ decision, trendSummary, fallback }) {
  const observation = decision.actionPlan.observation
  const references = [decision.actionPlan.action, decision.pattern.label]

  if (
    decision.warningSignal.level !== 'calm' &&
    isDistinctCopy(fallback, references)
  ) {
    return fallback
  }

  if (isDistinctCopy(observation, references)) {
    return observation
  }

  if (trendSummary?.summaryLabel && isDistinctCopy(trendSummary.summaryLabel, references)) {
    return trendSummary.summaryLabel
  }

  return fallback
}

function buildMetricLine({ metrics, formatDuration }) {
  const details = []

  if (metrics.averageInterval) {
    details.push(`Intervalo m\u00e9dio ${formatDuration(metrics.averageInterval)}`)
  }

  if (metrics.averageDuration) {
    details.push(`dura\u00e7\u00e3o ${formatDuration(metrics.averageDuration)}`)
  }

  return details.join(' • ')
}

export function mapDecisionToDecisionCardViewModel({ decision, metrics, trendSummary, formatDuration }) {
  const fallbackReason =
    decision.warningSignal.level === 'critical'
      ? DECISION_COPY.precedence.warningSignal.observationCritical
      : decision.warningSignal.level === 'warning'
        ? DECISION_COPY.precedence.warningSignal.observationWarning
        : trendSummary?.summaryLabel || decision.pattern.patternLabel || DECISION_COPY.ui.lowDataReason

  const reasonLine = buildReasonLine({
    decision,
    trendSummary,
    fallback: fallbackReason,
  })

  return {
    eyebrow: DECISION_COPY.ui.currentReading,
    badgeLabel: getUrgencyLabel(decision.decision.urgency),
    urgencyLabel: getUrgencyLabel(decision.decision.urgency),
    readingLabel: DECISION_COPY.ui.patternLabel,
    readingTitle: decision.pattern.label,
    actionLabel: DECISION_COPY.ui.actionLabel,
    reasonLabel: DECISION_COPY.ui.reasonLabel,
    actionTitle: decision.actionPlan.action,
    reasonLine,
    limitation: decision.actionPlan.limitation,
    adjustmentCopy: formatAdjustmentCopy(decision.readingAdjustmentReasons),
    metricLine: buildMetricLine({ metrics, formatDuration }),
    urgency: decision.decision.urgency,
    isCritical: decision.decision.urgency === 'critical',
  }
}
