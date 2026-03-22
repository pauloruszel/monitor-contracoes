export function getWarningSignalAssessment(signals) {
  const safeSignals = {
    mucusPlug: false,
    watersBroken: false,
    meconium: false,
    reducedMovement: false,
    bleeding: false,
    badSmellOrFever: false,
    preterm: false,
    ...signals,
  }

  if (
    safeSignals.meconium ||
    safeSignals.reducedMovement ||
    safeSignals.bleeding ||
    safeSignals.badSmellOrFever ||
    (safeSignals.watersBroken && safeSignals.preterm)
  ) {
    return {
      level: 'critical',
      title: 'Ir ao hospital / procurar atendimento',
      message:
        'Há um sinal de alerta importante. Procurem atendimento imediatamente ou falem com a equipe agora.',
      alertKey: 'warning-signal-critical',
    }
  }

  if (safeSignals.watersBroken) {
    return {
      level: 'warning',
      title: 'Entrar em contato com a maternidade',
      message:
        'A bolsa pode ter rompido. Entrem em contato com a maternidade ou com a equipe para orientação agora.',
      alertKey: 'warning-signal-waters',
    }
  }

  if (safeSignals.mucusPlug && safeSignals.preterm) {
    return {
      level: 'warning',
      title: 'Avisar a equipe',
      message:
        'Perda do tampão antes de 37 semanas merece avaliação. Falem com a equipe ou maternidade.',
      alertKey: 'warning-signal-mucus-preterm',
    }
  }

  if (safeSignals.mucusPlug) {
    return {
      level: 'attention',
      title: 'Observar',
      message:
        'Perda do tampão isoladamente pode acontecer antes do trabalho de parto e não exige ida imediata ao hospital.',
      alertKey: '',
    }
  }

  return {
    level: 'calm',
    title: 'Sem alerta adicional',
    message: 'Nenhum sinal de alerta adicional foi marcado até agora.',
    alertKey: '',
  }
}
