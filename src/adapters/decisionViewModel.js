import { DECISION_COPY } from '../content/decisionCopy'
import { formatAdjustmentCopy } from '../utils/sessionContextUtils'

function getUrgencyLabel(urgency) {
  if (urgency === 'critical') return DECISION_COPY.ui.urgentAction
  if (urgency === 'warning') return DECISION_COPY.ui.highAttention
  if (urgency === 'attention') return DECISION_COPY.ui.closeFollowUp
  return DECISION_COPY.ui.currentSituation
}

function buildMetricLine({ metrics, formatDuration }) {
  const details = []

  if (metrics.averageInterval) {
    details.push(`Intervalo m\u00e9dio ${formatDuration(metrics.averageInterval)}`)
  }

  if (metrics.averageDuration) {
    details.push(`duracao ${formatDuration(metrics.averageDuration)}`)
  }

  return details.join(' - ')
}

export function mapDecisionToDecisionCardViewModel({ decision, metrics, trendSummary, formatDuration }) {
  return {
    eyebrow: DECISION_COPY.ui.currentReading,
    badgeLabel: decision.actionPlan.action,
    urgencyLabel: getUrgencyLabel(decision.decision.urgency),
    readingLabel: DECISION_COPY.ui.patternLabel,
    readingTitle: decision.pattern.label,
    actionLabel: DECISION_COPY.ui.actionLabel,
    actionTitle: decision.actionPlan.action,
    observation: decision.actionPlan.observation,
    interpretation: decision.actionPlan.interpretation,
    limitation: decision.actionPlan.limitation,
    adjustmentCopy: formatAdjustmentCopy(decision.readingAdjustmentReasons),
    metricLine: buildMetricLine({ metrics, formatDuration }),
    urgency: decision.decision.urgency,
    isCritical: decision.decision.urgency === 'critical',
    primaryReason:
      decision.warningSignal.level === 'critical'
        ? DECISION_COPY.precedence.warningSignal.observationCritical
        : decision.warningSignal.level === 'warning'
          ? DECISION_COPY.precedence.warningSignal.observationWarning
          : trendSummary?.summaryLabel || decision.pattern.patternLabel || DECISION_COPY.ui.lowDataReason,
  }
}
