import { describe, expect, it } from 'vitest'
import {
  formatAdjustmentCopy,
  getActiveSessionContextItems,
  getActionAdjustmentReasons,
  getAdjustmentReasons,
  getClinicalContextItems,
  getReadingAdjustmentReasons,
  normalizeSessionContext,
} from './sessionContextUtils'

describe('sessionContextUtils', () => {
  it('normalizeSessionContext completa defaults', () => {
    expect(normalizeSessionContext({ notes: 'ok' })).toEqual({
      homeObservationGuidance: false,
      longTravelToHospital: false,
      bagReady: false,
      notes: 'ok',
    })
  })

  it('getActiveSessionContextItems lista apenas itens operacionais ativos', () => {
    const result = getActiveSessionContextItems({
      homeObservationGuidance: true,
      longTravelToHospital: true,
      bagReady: false,
    })

    expect(result).toHaveLength(2)
    expect(result[0]).toContain('observar em casa')
    expect(result[1]).toContain('hospital')
  })

  it('getClinicalContextItems resume perfil e preferencias ativas', () => {
    const result = getClinicalContextItems({
      userProfile: {
        firstPregnancy: true,
        priorFastLabor: true,
        gestationalWeeks: '40',
      },
      clinicalPreferences: {
        useFiveOneOne: true,
        notifyDoulaEarly: true,
        alertSensitivity: 'high',
      },
    })

    expect(result).toHaveLength(6)
    expect(result[0]).toContain('Parto anterior')
    expect(result[1]).toContain('Primeira')
    expect(result[3]).toContain('doula')
    expect(result[4]).toContain('5-1-1')
  })

  it('getReadingAdjustmentReasons resume fatores da leitura', () => {
    const result = getReadingAdjustmentReasons({
      patternKey: 'prodomos',
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {
        alertSensitivity: 'high',
      },
      sessionContext: {
        longTravelToHospital: true,
      },
    })

    expect(result).toHaveLength(3)
    expect(result[0]).toContain('parto')
    expect(result[1]).toContain('sensibilidade')
    expect(result[2]).toContain('deslocamento')
  })

  it('getActionAdjustmentReasons resume fatores da conduta', () => {
    const result = getActionAdjustmentReasons({
      patternKey: 'prodomos',
      trendSummary: {
        intervalTrend: { label: 'shortening' },
      },
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {
        notifyDoulaEarly: true,
      },
      wellbeingSummary: {
        dominant: 'red',
      },
    })

    expect(result).toHaveLength(3)
    expect(result[0]).toContain('aviso precoce')
    expect(result[1]).toContain('parto')
    expect(result[2]).toContain('dor')
  })

  it('getAdjustmentReasons mantem compatibilidade com a fachada antiga', () => {
    const result = getAdjustmentReasons({
      phaseKey: 'prodomos',
      userProfile: {
        priorFastLabor: true,
      },
    })

    expect(result).toEqual([expect.stringContaining('parto')])
  })

  it('formatAdjustmentCopy monta a linha pronta para o card', () => {
    expect(formatAdjustmentCopy([])).toBe('')
    expect(formatAdjustmentCopy(['historico de parto rapido'])).toContain('Esta leitura foi ajustada por')
  })
})
