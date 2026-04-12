import { defaultSessionContext } from './storage'

export function normalizeSessionContext(sessionContext) {
  return {
    ...defaultSessionContext,
    ...(sessionContext || {}),
    notes: sessionContext?.notes || '',
  }
}

export function getActiveSessionContextItems(sessionContext) {
  const context = normalizeSessionContext(sessionContext)
  const items = []

  if (context.homeObservationGuidance) {
    items.push('Orientação para observar em casa')
  }

  if (context.longTravelToHospital) {
    items.push('Deslocamento longo até o hospital')
  }

  if (context.bagReady) {
    items.push('Bolsa e documentos já separados')
  }

  return items
}

export function getClinicalContextItems({ userProfile, clinicalPreferences }) {
  const items = []

  if (userProfile?.priorFastLabor) {
    items.push('Parto anterior rápido')
  }

  if (userProfile?.firstPregnancy) {
    items.push('Primeira gestação')
  }

  if (userProfile?.gestationalWeeks) {
    items.push(`${userProfile.gestationalWeeks} semanas`)
  }

  if (clinicalPreferences?.notifyDoulaEarly) {
    items.push('Aviso precoce para a doula')
  }

  if (clinicalPreferences?.useFiveOneOne) {
    items.push('Referência 5-1-1 habilitada')
  }

  if (clinicalPreferences?.alertSensitivity === 'high') {
    items.push('Sensibilidade alta de alerta')
  }

  if (clinicalPreferences?.alertSensitivity === 'low') {
    items.push('Sensibilidade baixa de alerta')
  }

  return items
}

export function getAdjustmentReasons({ phaseKey, trendSummary, userProfile, clinicalPreferences }) {
  const reasons = []

  if (userProfile?.priorFastLabor) {
    reasons.push('histórico de parto rápido')
  }

  if (clinicalPreferences?.alertSensitivity === 'high') {
    reasons.push('sensibilidade alta de alerta')
  }

  if (
    phaseKey === 'prodomos' &&
    clinicalPreferences?.notifyDoulaEarly &&
    trendSummary?.intervalTrend?.label === 'shortening'
  ) {
    reasons.push('preferência de aviso precoce para a doula')
  }

  return reasons
}

export function formatAdjustmentCopy(reasons) {
  if (!reasons || reasons.length === 0) return ''
  if (reasons.length === 1) return `Esta leitura foi ajustada por ${reasons[0]}.`
  if (reasons.length === 2) return `Esta leitura foi ajustada por ${reasons[0]} e ${reasons[1]}.`

  return `Esta leitura foi ajustada por ${reasons.slice(0, -1).join(', ')} e ${reasons.at(-1)}.`
}
