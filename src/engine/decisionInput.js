const DEFAULT_WELLBEING_SUMMARY = {
  dominant: 'green',
  label: 'Sem sinal adicional de dor importante',
}

export function buildDecisionInput({
  contractions,
  intervals,
  averageDuration,
  averageInterval,
  trendSummary,
  warningSignals,
  sessionContext,
  userProfile,
  clinicalPreferences,
  wellbeingSummary,
}) {
  return {
    temporalInput: {
      contractions,
      intervals,
      averageDuration,
      averageInterval,
      trendSummary,
    },
    warningSignals,
    sessionContext,
    userProfile,
    clinicalPreferences,
    wellbeingSummary: wellbeingSummary || DEFAULT_WELLBEING_SUMMARY,
  }
}
