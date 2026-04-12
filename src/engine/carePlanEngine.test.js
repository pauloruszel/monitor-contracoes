import { describe, expect, it } from 'vitest'
import { buildCarePlan } from './carePlanEngine'

describe('carePlanEngine', () => {
  it('adiciona referência 5-1-1 apenas como apoio textual na leitura latente', () => {
    const result = buildCarePlan({
      patternKey: 'latente',
      trendSummary: {
        intervalTrend: { label: 'stable' },
      },
      userProfile: {},
      clinicalPreferences: {
        useFiveOneOne: true,
      },
    })

    expect(result.action).toBe('Avisar a doula')
    expect(result.observation).toContain('fase latente')
    expect(result.interpretation).toContain('5-1-1')
    expect(result.limitation).toBe('')
  })

  it('não menciona 5-1-1 fora do padrão latente', () => {
    const result = buildCarePlan({
      patternKey: 'ativa',
      trendSummary: {
        intervalTrend: { label: 'stable' },
      },
      userProfile: {},
      clinicalPreferences: {
        useFiveOneOne: true,
      },
    })

    expect(result.action).toBe('Preparar ida')
    expect(result.interpretation).not.toContain('5-1-1')
    expect(result.limitation).toContain('Leitura baseada no padrão recente')
  })

  it('eleva a conduta para aviso precoce quando o padrão ainda está inicial e encurtando', () => {
    const result = buildCarePlan({
      patternKey: 'prodomos',
      trendSummary: {
        intervalTrend: { label: 'shortening' },
      },
      userProfile: {},
      clinicalPreferences: {
        notifyDoulaEarly: true,
      },
    })

    expect(result.action).toBe('Avisar a doula cedo')
    expect(result.observation).toContain('avisar a doula mais cedo')
    expect(result.alertMessage).toContain('Avisar a doula cedo')
  })

  it('mantém a cópia base quando não há preferências nem tendência relevante', () => {
    const result = buildCarePlan({
      patternKey: 'prodomos',
      trendSummary: null,
      userProfile: {},
      clinicalPreferences: {},
    })

    expect(result.action).toBe('Continuar em casa')
    expect(result.observation).toContain('Continuem em casa')
    expect(result.interpretation).toContain('observação sem pressa')
    expect(result.limitation).toBe('')
  })

  it('adiciona contexto de tendência e histórico rápido na interpretação', () => {
    const result = buildCarePlan({
      patternKey: 'latente',
      trendSummary: {
        intervalTrend: { label: 'spacing' },
      },
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {},
    })

    expect(result.interpretation).toContain('mais espacado')
    expect(result.interpretation).toContain('parto rapido anterior')
  })
  it('usa prodomos como fallback quando a chave do padrao nao existe', () => {
    const result = buildCarePlan({
      patternKey: 'desconhecido',
      trendSummary: null,
      userProfile: {},
      clinicalPreferences: {},
    })

    expect(result.action).toBe('Continuar em casa')
    expect(result.observation).toContain('inicial')
    expect(result.alertMessage).toBe('')
  })
})
