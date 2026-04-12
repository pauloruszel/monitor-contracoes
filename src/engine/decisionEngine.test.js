import { describe, expect, it } from 'vitest'
import { getSessionDecision } from './decisionEngine'

function makeContractions(count) {
  return Array.from({ length: count }, (_, index) => ({ id: `${index}` }))
}

describe('decisionEngine', () => {
  it('combina padrao temporal e contexto obstetrico na leitura retornada', () => {
    const result = getSessionDecision({
      contractions: makeContractions(4),
      intervals: [300, 360, 420],
      averageDuration: 35,
      averageInterval: 360,
      trendSummary: {
        intervalTrend: { label: 'spacing' },
        durationTrend: { label: 'stable' },
        regularity: { label: 'regular' },
      },
      warningSignals: {},
      sessionContext: {
        longTravelToHospital: true,
      },
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {
        alertSensitivity: 'high',
      },
    })

    expect(result.pattern.key).toBe('latente')
    expect(result.pattern.patternLabel).toContain('espa')
    expect(result.pattern.description).toContain('deslocamento longo')
    expect(result.readingAdjustmentReasons).toHaveLength(3)
    expect(result.readingAdjustmentReasons[0]).toContain('parto')
    expect(result.readingAdjustmentReasons[1]).toContain('sensibilidade')
    expect(result.readingAdjustmentReasons[2]).toContain('deslocamento')
    expect(result.decision.urgency).toBe('attention')
  })

  it('prioriza alerta clinico sobre a conduta temporal', () => {
    const result = getSessionDecision({
      contractions: makeContractions(4),
      intervals: [300, 360, 420],
      averageDuration: 35,
      averageInterval: 360,
      trendSummary: null,
      warningSignals: {
        watersBroken: true,
      },
    })

    expect(result.pattern.key).toBe('latente')
    expect(result.warningSignal.level).toBe('warning')
    expect(result.actionPlan.action).toContain('maternidade')
    expect(result.actionPlan.interpretation).toContain('antes da leitura do ritmo')
    expect(result.decision.precedenceKey).toBe('warning_signal_warning')
    expect(result.decision.urgency).toBe('warning')
  })

  it('ajusta a conduta por bem-estar sem mudar a leitura base', () => {
    const result = getSessionDecision({
      contractions: makeContractions(4),
      intervals: [600, 620, 610],
      averageDuration: 30,
      averageInterval: 610,
      trendSummary: null,
      warningSignals: {},
      wellbeingSummary: {
        dominant: 'yellow',
      },
    })

    expect(result.pattern.key).toBe('prodomos')
    expect(result.actionPlan.action).toBe('Continuar em casa')
    expect(result.actionPlan.interpretation).toContain('mais')
    expect(result.decision.precedenceKey).toBe('wellbeing_attention')
    expect(result.decision.urgency).toBe('calm')
  })

  it('prioriza sangramento mesmo com poucos dados temporais', () => {
    const result = getSessionDecision({
      contractions: makeContractions(1),
      intervals: [],
      averageDuration: 0,
      averageInterval: 0,
      trendSummary: null,
      warningSignals: {
        bleeding: true,
      },
    })

    expect(result.pattern.key).toBe('prodomos')
    expect(result.warningSignal.level).toBe('critical')
    expect(result.actionPlan.action).toContain('atendimento')
    expect(result.decision.precedenceKey).toBe('warning_signal_critical')
  })

  it('eleva a conduta por preferencia de aviso precoce com padrao encurtando', () => {
    const result = getSessionDecision({
      contractions: makeContractions(4),
      intervals: [600, 620, 610],
      averageDuration: 30,
      averageInterval: 610,
      trendSummary: {
        intervalTrend: { label: 'shortening' },
        durationTrend: { label: 'stable' },
        regularity: { label: 'regular' },
      },
      warningSignals: {},
      clinicalPreferences: {
        notifyDoulaEarly: true,
      },
    })

    expect(result.pattern.key).toBe('prodomos')
    expect(result.actionPlan.action).toBe('Avisar a doula cedo')
    expect(result.actionAdjustmentReasons.some((item) => item.includes('aviso precoce'))).toBe(true)
  })
})
