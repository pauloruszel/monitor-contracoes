export const DECISION_ENGINE_VERSION = '2026-04-v2'

export const DECISION_PRECEDENCE = [
  {
    key: 'warning_signal_critical',
    priority: 100,
    matches: ({ warningSignal }) => warningSignal.level === 'critical',
  },
  {
    key: 'warning_signal_warning',
    priority: 90,
    matches: ({ warningSignal }) => warningSignal.level === 'warning',
  },
  {
    key: 'wellbeing_severe',
    priority: 70,
    matches: ({ wellbeingSummary }) => wellbeingSummary?.dominant === 'red',
  },
  {
    key: 'wellbeing_attention',
    priority: 60,
    matches: ({ wellbeingSummary, pattern }) =>
      wellbeingSummary?.dominant === 'yellow' && pattern.key === 'prodomos',
  },
  {
    key: 'temporal_pattern',
    priority: 40,
    matches: () => true,
  },
]

export const DECISION_COPY = {
  precedence: {
    warningSignal: {
      interpretation: 'O alerta vem antes da leitura do ritmo.',
      observationCritical: 'H\u00e1 sinal de alerta com prioridade imediata.',
      observationWarning: 'H\u00e1 sinal de alerta ativo e ele vem antes da an\u00e1lise do ritmo.',
    },
    wellbeing: {
      severe: {
        interpretation: 'Muita dor recente. Vale falar com a doula ou equipe agora.',
      },
      attention: {
        interpretation: 'Ainda parece in\u00edcio, mas j\u00e1 pede observa\u00e7\u00e3o mais pr\u00f3xima.',
      },
    },
  },
  ui: {
    currentReading: 'Leitura atual',
    patternLabel: 'Leitura do padr\u00e3o',
    actionLabel: 'Conduta sugerida',
    reasonLabel: 'Motivo',
    urgentAction: 'A\u00e7\u00e3o imediata',
    highAttention: 'Aten\u00e7\u00e3o alta',
    closeFollowUp: 'Acompanhar de perto',
    currentSituation: 'Situacao atual',
    lowDataReason: 'Ainda h\u00e1 poucos dados para um padr\u00e3o mais claro.',
  },
}
