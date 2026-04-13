export const STRONG_PATTERN_LIMITATION =
  'Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.'

export const CLINICAL_PATTERN_COPY = {
  prodomos: {
    label: 'Padr\u00e3o inicial ou espa\u00e7ado',
    recommendation: {
      title: 'Continuar em casa',
      message:
        'O padr\u00e3o atual ainda parece inicial ou espa\u00e7ado. Continuem em casa, descansando e observando.',
      secondary: 'Comam, se hidratem e mantenham a observa\u00e7\u00e3o sem pressa.',
      alertMessage: '',
    },
    descriptions: {
      lowData: 'Ainda h\u00e1 poucos registros para identificar um padr\u00e3o consistente.',
      regular: 'O padr\u00e3o recente ainda parece inicial ou mais espa\u00e7ado.',
      irregular: 'O padr\u00e3o recente ainda est\u00e1 espa\u00e7ado e irregular.',
    },
  },
  latente: {
    label: 'Padr\u00e3o compat\u00edvel com fase latente',
    recommendation: {
      title: 'Avisar a doula',
      message: 'O padr\u00e3o atual pode ser compat\u00edvel com fase latente. Avise a doula e siga monitorando.',
      secondary: 'Continuem em casa, com hidrata\u00e7\u00e3o, descanso e aten\u00e7\u00e3o ao padr\u00e3o.',
      alertMessage: 'Padr\u00e3o compat\u00edvel com fase latente. Avisar a doula.',
    },
    descriptions: {
      regular: 'As contra\u00e7\u00f5es entraram numa faixa que pode ser compat\u00edvel com fase latente.',
      irregular: 'As contra\u00e7\u00f5es est\u00e3o mais frequentes, mas o padr\u00e3o ainda est\u00e1 irregular.',
    },
  },
  ativa: {
    label: 'Padr\u00e3o mais intenso e mais pr\u00f3ximo',
    recommendation: {
      title: 'Preparar ida',
      message:
        'O padr\u00e3o atual est\u00e1 mais intenso e mais pr\u00f3ximo. Vale preparar a ida e seguir a orienta\u00e7\u00e3o da equipe.',
      secondary:
        'Separem documentos, bolsa e observem se o padr\u00e3o segue consistente. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
      alertMessage: 'Padr\u00e3o mais intenso e mais pr\u00f3ximo. Preparar ida ao hospital.',
    },
    descriptions: {
      regular:
        'As contra\u00e7\u00f5es parecem mais pr\u00f3ximas e consistentes. Isso pode sugerir progress\u00e3o do padr\u00e3o. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
      irregular:
        'As contra\u00e7\u00f5es parecem mais pr\u00f3ximas, com sinais de intensifica\u00e7\u00e3o. Isso pode sugerir progress\u00e3o do padr\u00e3o. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
    },
  },
  transicao: {
    label: 'Padr\u00e3o muito frequente',
    recommendation: {
      title: 'Ir ao hospital',
      message:
        'O padr\u00e3o atual est\u00e1 muito frequente. Procurem avalia\u00e7\u00e3o agora e sigam a orienta\u00e7\u00e3o da equipe.',
      secondary:
        'Procurem atendimento agora. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
      alertMessage: 'Padr\u00e3o muito frequente. Procurar avalia\u00e7\u00e3o agora.',
    },
    descriptions: {
      regular:
        'Os intervalos est\u00e3o muito curtos e o padr\u00e3o exige avalia\u00e7\u00e3o mais urgente. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
      irregular:
        'Os intervalos est\u00e3o muito curtos e intensos, mesmo com irregularidade. Isso exige avalia\u00e7\u00e3o mais urgente. Leitura baseada no padr\u00e3o recente. N\u00e3o confirma est\u00e1gio cl\u00ednico do parto.',
    },
  },
}

export const CLINICAL_PHASE_COPY = CLINICAL_PATTERN_COPY

export const WARNING_SIGNAL_COPY = {
  critical: {
    title: 'Procurar atendimento agora',
    message:
      'H\u00e1 um sinal de alerta importante. Procurem atendimento imediatamente ou falem com a equipe agora.',
  },
  watersBroken: {
    title: 'Entrar em contato com a maternidade',
    message:
      'A bolsa pode ter rompido. Entrem em contato com a maternidade ou com a equipe para orienta\u00e7\u00e3o agora.',
  },
  mucusPreterm: {
    title: 'Avisar a equipe',
    message:
      'Perda do tamp\u00e3o antes de 37 semanas merece avalia\u00e7\u00e3o. Falem com a equipe ou maternidade.',
  },
  mucusPlug: {
    title: 'Observar',
    message:
      'Perda do tamp\u00e3o isoladamente pode acontecer antes do trabalho de parto e n\u00e3o define a necessidade de ida imediata ao hospital.',
  },
  calm: {
    title: 'Sem alerta adicional',
    message: 'Nenhum sinal de alerta adicional foi marcado at\u00e9 agora.',
  },
}

export const CARE_PLAN_ADJUSTMENTS = {
  notifyDoulaEarlyTitle: 'Avisar a doula cedo',
  notifyDoulaEarlyMessage:
    'O padrão ainda parece inicial, mas vale avisar a doula mais cedo e seguir observando.',
  notifyDoulaEarlyAlert: 'Padrão inicial encurtando. Avisar a doula cedo.',
  intervalShortening: 'O padrão recente está encurtando.',
  intervalSpacing: 'O padrão recente está mais espaçado.',
  fiveOneOneHint: 'Observe se o padrão se aproxima do critério 5-1-1.',
  priorFastLaborHint: 'Como houve parto rápido anterior, mantenham atenção extra.',
}

export const OBSTETRIC_CONTEXT_ADJUSTMENTS = {
  intervalShortening: 'A janela recente sugere intervalos encurtando.',
  durationIncreasing: 'A duração média também está aumentando.',
  patternRegular: 'O padrão está mais consistente.',
  priorFastLaborWarning: 'Como já houve parto rápido, vale observar com atenção extra.',
  highAlertSensitivity:
    'A sensibilidade de alerta está configurada para acompanhar mudanças mais cedo.',
  longTravelToHospital: 'Há deslocamento longo até o hospital.',
  patternLabelShortening: 'Padrão encurtando',
  patternLabelSpacing: 'Padrão espaçando',
}
