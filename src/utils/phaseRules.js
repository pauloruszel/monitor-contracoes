function getIrregularity(intervals) {
  if (intervals.length < 3) return false
  const max = Math.max(...intervals)
  const min = Math.min(...intervals)
  return max - min > 180
}

export function getPhaseFromMetrics({ contractions, intervals, averageDuration, averageInterval }) {
  if (contractions.length < 2 || !averageInterval) {
    return {
      key: 'prodomos',
      label: 'Pródromos / início',
      patternLabel: 'Poucos dados',
      description: 'Ainda há poucos registros para identificar um padrão consistente.',
      urgency: 'calm',
      alertKey: '',
    }
  }

  const irregular = getIrregularity(intervals)
  const avgMinutes = averageInterval / 60

  if (avgMinutes < 3) {
    return {
      key: 'transicao',
      label: 'Transição provável',
      patternLabel: irregular ? 'Padrão intenso' : 'Padrão muito frequente',
      description: 'Intervalos muito curtos indicam uma fase urgente. Procurem atendimento agora.',
      urgency: 'critical',
      alertKey: 'hospital-now',
    }
  }

  if (avgMinutes <= 4 && averageDuration >= 45) {
    return {
      key: 'ativa',
      label: 'Fase ativa provável',
      patternLabel: irregular ? 'Padrão encurtando' : 'Padrão consistente',
      description: 'As contrações já parecem mais fortes e próximas. Hora de preparar a ida.',
      urgency: 'warning',
      alertKey: 'prepare-hospital',
    }
  }

  if (avgMinutes <= 7) {
    return {
      key: 'latente',
      label: 'Fase latente',
      patternLabel: irregular ? 'Padrão ainda irregular' : 'Padrão em faixa latente',
      description: 'As contrações entraram numa frequência mais típica da fase latente.',
      urgency: 'attention',
      alertKey: 'call-doula',
    }
  }

  return {
    key: 'prodomos',
    label: 'Pródromos / início',
    patternLabel: irregular ? 'Padrão ainda irregular' : 'Padrão espaçado',
    description:
      'Ainda parece início / pródromos. Continuem em casa, descansando e observando.',
    urgency: 'calm',
    alertKey: '',
  }
}

export function getRecommendationFromPhase(phaseKey) {
  switch (phaseKey) {
    case 'latente':
      return {
        title: 'Avisar a doula',
        message: 'Fase latente. Avise a doula e continue monitorando.',
        secondary: 'Continuem em casa, com hidratação, descanso e atenção ao padrão.',
        alertMessage: 'Fase latente. Avisar a doula.',
      }
    case 'ativa':
      return {
        title: 'Preparar ida',
        message: 'Fase ativa provável. Preparem-se para ir ao hospital.',
        secondary: 'Separem documentos, bolsa e observem se o padrão segue consistente.',
        alertMessage: 'Fase ativa provável. Preparar ida ao hospital.',
      }
    case 'transicao':
      return {
        title: 'Ir ao hospital',
        message: 'Transição provável. Ir ao hospital imediatamente.',
        secondary: 'Procurem atendimento agora. O app não substitui avaliação profissional.',
        alertMessage: 'Transição provável. Ir ao hospital agora.',
      }
    default:
      return {
        title: 'Continuar em casa',
        message: 'Ainda parece início / pródromos. Continuem em casa, descansando e observando.',
        secondary: 'Comam, se hidratem e mantenham a observação sem pressa.',
        alertMessage: '',
      }
  }
}
