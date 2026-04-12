import { describe, expect, it } from 'vitest'
import {
  formatAdjustmentCopy,
  getActiveSessionContextItems,
  getAdjustmentReasons,
  getClinicalContextItems,
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
    expect(
      getActiveSessionContextItems({
        homeObservationGuidance: true,
        longTravelToHospital: true,
        bagReady: false,
      }),
    ).toEqual(['Orientação para observar em casa', 'Deslocamento longo até o hospital'])
  })

  it('getClinicalContextItems resume perfil e preferências ativas', () => {
    expect(
      getClinicalContextItems({
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
      }),
    ).toEqual([
      'Parto anterior rápido',
      'Primeira gestação',
      '40 semanas',
      'Aviso precoce para a doula',
      'Referência 5-1-1 habilitada',
      'Sensibilidade alta de alerta',
    ])
  })

  it('getAdjustmentReasons resume só os fatores que ajustam a leitura', () => {
    expect(
      getAdjustmentReasons({
        phaseKey: 'prodomos',
        trendSummary: {
          intervalTrend: { label: 'shortening' },
        },
        userProfile: {
          priorFastLabor: true,
        },
        clinicalPreferences: {
          alertSensitivity: 'high',
          notifyDoulaEarly: true,
        },
      }),
    ).toEqual([
      'histórico de parto rápido',
      'sensibilidade alta de alerta',
      'preferência de aviso precoce para a doula',
    ])
  })

  it('formatAdjustmentCopy monta a linha pronta para o card', () => {
    expect(formatAdjustmentCopy([])).toBe('')
    expect(formatAdjustmentCopy(['histórico de parto rápido'])).toBe(
      'Esta leitura foi ajustada por histórico de parto rápido.',
    )
  })
})
