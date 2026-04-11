export const PHASES = {
  prodomos: {
    key: 'prodomos',
    label: 'Pródromos / início',
    urgency: 'calm',
    alertKey: '',
  },
  latente: {
    key: 'latente',
    label: 'Fase latente',
    urgency: 'attention',
    alertKey: 'call-doula',
  },
  ativa: {
    key: 'ativa',
    label: 'Fase ativa provável',
    urgency: 'warning',
    alertKey: 'prepare-hospital',
  },
  transicao: {
    key: 'transicao',
    label: 'Transição provável',
    urgency: 'critical',
    alertKey: 'hospital-now',
  },
}

export const RECOMMENDATIONS = {
  prodomos: {
    title: 'Continuar em casa',
    message: 'Ainda parece início / pródromos. Continuem em casa, descansando e observando.',
    secondary: 'Comam, se hidratem e mantenham a observação sem pressa.',
    alertMessage: '',
  },
  latente: {
    title: 'Avisar a doula',
    message: 'Fase latente. Avise a doula e continue monitorando.',
    secondary: 'Continuem em casa, com hidratação, descanso e atenção ao padrão.',
    alertMessage: 'Fase latente. Avisar a doula.',
  },
  ativa: {
    title: 'Preparar ida',
    message: 'Fase ativa provável. Preparem-se para ir ao hospital.',
    secondary: 'Separem documentos, bolsa e observem se o padrão segue consistente.',
    alertMessage: 'Fase ativa provável. Preparar ida ao hospital.',
  },
  transicao: {
    title: 'Ir ao hospital',
    message: 'Transição provável. Ir ao hospital imediatamente.',
    secondary: 'Procurem atendimento agora. O app não substitui avaliação profissional.',
    alertMessage: 'Transição provável. Ir ao hospital agora.',
  },
}

export function getIrregularity(intervals) {
  if (intervals.length < 3) return false
  const max = Math.max(...intervals)
  const min = Math.min(...intervals)
  return max - min > 180
}

export function evaluateAlertRules() {
  return null
}

function appendContext(text, additions) {
  const extras = additions.filter(Boolean)
  if (extras.length === 0) return text
  return `${text} ${extras.join(' ')}`
}

export function evaluateProfileAdjustments({
  phaseResult,
  trendSummary,
  userProfile,
  clinicalPreferences,
}) {
  const result = { ...phaseResult }
  const intervalTrend = trendSummary?.intervalTrend?.label
  const durationTrend = trendSummary?.durationTrend?.label
  const regularity = trendSummary?.regularity?.label

  if (phaseResult.key === 'prodomos' && intervalTrend === 'shortening') {
    result.patternLabel = 'Padrão encurtando'
  }

  if (phaseResult.key === 'latente' && intervalTrend === 'spacing') {
    result.patternLabel = 'Padrão espaçando'
  }

  result.description = appendContext(result.description, [
    intervalTrend === 'shortening' ? 'A janela recente sugere intervalos encurtando.' : '',
    durationTrend === 'increasing' ? 'A duração média também está aumentando.' : '',
    regularity === 'regular' ? 'O padrão está mais consistente.' : '',
    userProfile?.priorFastLabor ? 'Como já houve parto rápido, vale observar com atenção extra.' : '',
    clinicalPreferences?.alertSensitivity === 'high'
      ? 'A sensibilidade de alerta está configurada para acompanhar mudanças mais cedo.'
      : '',
  ])

  return result
}

export function evaluatePhaseRules({ contractions, intervals, averageDuration, averageInterval }) {
  if (contractions.length < 2 || !averageInterval) {
    return {
      ...PHASES.prodomos,
      patternLabel: 'Poucos dados',
      description: 'Ainda há poucos registros para identificar um padrão consistente.',
    }
  }

  const irregular = getIrregularity(intervals)
  const avgMinutes = averageInterval / 60

  if (avgMinutes < 3) {
    return {
      ...PHASES.transicao,
      patternLabel: irregular ? 'Padrão intenso' : 'Padrão muito frequente',
      description: 'Intervalos muito curtos indicam uma fase urgente. Procurem atendimento agora.',
    }
  }

  if (avgMinutes <= 4 && averageDuration >= 45) {
    return {
      ...PHASES.ativa,
      patternLabel: irregular ? 'Padrão encurtando' : 'Padrão consistente',
      description: 'As contrações já parecem mais fortes e próximas. Hora de preparar a ida.',
    }
  }

  if (avgMinutes <= 7) {
    return {
      ...PHASES.latente,
      patternLabel: irregular ? 'Padrão ainda irregular' : 'Padrão em faixa latente',
      description: 'As contrações entraram numa frequência mais típica da fase latente.',
    }
  }

  return {
    ...PHASES.prodomos,
    patternLabel: irregular ? 'Padrão ainda irregular' : 'Padrão espaçado',
    description: 'Ainda parece início / pródromos. Continuem em casa, descansando e observando.',
  }
}

export function buildRecommendation({ phaseKey, trendSummary, userProfile, clinicalPreferences }) {
  const base = { ...(RECOMMENDATIONS[phaseKey] || RECOMMENDATIONS.prodomos) }
  const intervalTrend = trendSummary?.intervalTrend?.label

  if (
    phaseKey === 'prodomos' &&
    clinicalPreferences?.notifyDoulaEarly &&
    intervalTrend === 'shortening'
  ) {
    base.title = 'Avisar a doula cedo'
    base.message = 'Ainda parece início, mas vale avisar a doula mais cedo e seguir observando.'
    base.alertMessage = 'Padrão inicial encurtando. Avisar a doula cedo.'
  }

  base.secondary = appendContext(base.secondary, [
    intervalTrend === 'shortening' ? 'O padrão recente está encurtando.' : '',
    intervalTrend === 'spacing' ? 'O padrão recente está mais espaçado.' : '',
    clinicalPreferences?.useFiveOneOne && phaseKey === 'latente'
      ? 'Observe se o padrão se aproxima do critério 5-1-1.'
      : '',
    userProfile?.priorFastLabor ? 'Como houve parto rápido anterior, mantenham atenção extra.' : '',
  ])

  return base
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
