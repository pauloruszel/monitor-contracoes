import { describe, expect, it } from 'vitest'
import {
  buildRecommendation,
  evaluateAlertRules,
  evaluatePhaseRules,
  evaluateProfileAdjustments,
  getIrregularity,
  getPhaseFromMetrics,
  getRecommendationFromPhase,
} from './phaseRules'

function makeContractions(count) {
  return Array.from({ length: count }, (_, index) => ({ id: `${index}` }))
}

describe('phaseRules', () => {
  it('getIrregularity detecta quando a variacao dos intervalos e alta', () => {
    expect(getIrregularity([300, 320])).toBe(false)
    expect(getIrregularity([120, 360, 480])).toBe(true)
  })

  it('evaluateAlertRules ainda nao faz override nesta fase', () => {
    expect(evaluateAlertRules({})).toBeNull()
  })

  it('evaluateProfileAdjustments mantem o resultado base nesta fase', () => {
    const phaseResult = { key: 'latente' }
    expect(evaluateProfileAdjustments({ phaseResult })).toMatchObject({
      key: 'latente',
      adjustmentReasons: [],
    })
  })

  it('retorna poucos dados quando ainda nao ha base suficiente', () => {
    const input = {
      contractions: makeContractions(1),
      intervals: [],
      averageDuration: 0,
      averageInterval: 0,
    }
    const result = getPhaseFromMetrics(input)
    const modularResult = evaluatePhaseRules(input)

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toBe('Poucos dados')
    expect(result.alertKey).toBe('')
    expect(modularResult).toEqual(evaluatePhaseRules(input))
    expect(result.adjustmentReasons).toEqual([])
  })

  it('considera padrao regular quando ha menos de tres intervalos', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(3),
      intervals: [300, 320],
      averageDuration: 35,
      averageInterval: 310,
    })

    expect(result.key).toBe('latente')
    expect(result.patternLabel).toBe('Padrão em faixa latente')
  })

  it('classifica transicao quando o intervalo medio e menor que 3 minutos', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [120, 140, 150],
      averageDuration: 50,
      averageInterval: 150,
    })

    expect(result).toMatchObject({
      key: 'transicao',
      urgency: 'critical',
      alertKey: 'hospital-now',
    })
  })

  it('classifica transicao irregular quando a variacao dos intervalos e alta', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [30, 150, 240],
      averageDuration: 50,
      averageInterval: 140,
    })

    expect(result.key).toBe('transicao')
    expect(result.patternLabel).toBe('Padrão intenso')
  })

  it('classifica fase ativa quando o intervalo esta entre 3 e 4 minutos com duracao suficiente', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [210, 220, 230],
      averageDuration: 45,
      averageInterval: 220,
    })

    expect(result).toMatchObject({
      key: 'ativa',
      urgency: 'warning',
      alertKey: 'prepare-hospital',
      patternLabel: 'Padrão consistente',
    })
  })

  it('classifica fase ativa irregular quando ha grande variacao', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [60, 220, 260],
      averageDuration: 50,
      averageInterval: 180,
    })

    expect(result.key).toBe('ativa')
    expect(result.patternLabel).toBe('Padrão encurtando')
  })

  it('nao entra em fase ativa quando a duracao media ainda e curta', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [180, 210, 240],
      averageDuration: 30,
      averageInterval: 210,
    })

    expect(result.key).toBe('latente')
  })

  it('classifica fase latente em faixa de 7 minutos', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [300, 360, 420],
      averageDuration: 35,
      averageInterval: 360,
    })

    expect(result).toMatchObject({
      key: 'latente',
      urgency: 'attention',
      alertKey: 'call-doula',
      patternLabel: 'Padrão em faixa latente',
    })
  })

  it('classifica fase latente irregular quando ha muita variacao', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [120, 360, 480],
      averageDuration: 35,
      averageInterval: 320,
    })

    expect(result.key).toBe('latente')
    expect(result.patternLabel).toBe('Padrão ainda irregular')
  })

  it('mantem prodomos com intervalos altos e padrao irregular', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [480, 720, 900],
      averageDuration: 30,
      averageInterval: 700,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toBe('Padrão ainda irregular')
  })

  it('mantem prodomos com intervalos espacados regulares', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [600, 620, 610],
      averageDuration: 30,
      averageInterval: 610,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toBe('Padrão espaçado')
  })

  it('retorna recomendacoes para todas as fases e fallback', () => {
    expect(getRecommendationFromPhase('latente')).toMatchObject({
      title: 'Avisar a doula',
      alertMessage: 'Fase latente. Avisar a doula.',
    })
    expect(getRecommendationFromPhase('ativa')).toMatchObject({
      title: 'Preparar ida',
      alertMessage: 'Fase ativa provável. Preparar ida ao hospital.',
    })
    expect(getRecommendationFromPhase('transicao')).toMatchObject({
      title: 'Ir ao hospital',
      alertMessage: 'Transição provável. Ir ao hospital agora.',
    })
    expect(getRecommendationFromPhase('qualquer-outra')).toMatchObject({
      title: 'Continuar em casa',
      alertMessage: '',
    })
  })

  it('buildRecommendation reutiliza o mesmo fallback das fachadas publicas', () => {
    expect(buildRecommendation({ phaseKey: 'latente' })).toMatchObject({
      title: 'Avisar a doula',
    })
    expect(buildRecommendation({ phaseKey: 'desconhecida' })).toMatchObject({
      title: 'Continuar em casa',
    })
  })

  it('evaluateProfileAdjustments enriquece a explicacao com tendencia e contexto', () => {
    const result = evaluateProfileAdjustments({
      phaseResult: {
        key: 'prodomos',
        patternLabel: 'Padrão espaçado',
        description: 'Ainda parece início / pródromos.',
      },
      trendSummary: {
        intervalTrend: { label: 'shortening' },
        durationTrend: { label: 'increasing' },
        regularity: { label: 'regular' },
      },
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {
        alertSensitivity: 'high',
      },
    })

    expect(result.patternLabel).toBe('Padrão encurtando')
    expect(result.description).toContain('A janela recente sugere intervalos encurtando.')
    expect(result.description).toContain('A duração média também está aumentando.')
    expect(result.description).toContain('Como já houve parto rápido')
    expect(result.description).toContain('sensibilidade de alerta')
    expect(result.adjustmentReasons).toHaveLength(2)
    expect(result.adjustmentReasons[0]).toContain('parto')
    expect(result.adjustmentReasons[1]).toBe('sensibilidade alta de alerta')
  })

  it('buildRecommendation usa preferencia de aviso cedo e adiciona contexto', () => {
    const result = buildRecommendation({
      phaseKey: 'prodomos',
      trendSummary: {
        intervalTrend: { label: 'shortening' },
      },
      userProfile: {
        priorFastLabor: true,
      },
      clinicalPreferences: {
        notifyDoulaEarly: true,
      },
    })

    expect(result.title).toBe('Avisar a doula cedo')
    expect(result.message).toContain('avisar a doula mais cedo')
    expect(result.secondary).toContain('O padrão recente está encurtando.')
    expect(result.secondary).toContain('parto rápido anterior')
    expect(result.alertMessage).toBe('Padrão inicial encurtando. Avisar a doula cedo.')
  })

  it('getRecommendationFromPhase aceita contexto opcional', () => {
    const result = getRecommendationFromPhase('latente', {
      trendSummary: {
        intervalTrend: { label: 'spacing' },
      },
      clinicalPreferences: {
        useFiveOneOne: true,
      },
    })

    expect(result.secondary).toContain('mais espaçado')
    expect(result.secondary).toContain('5-1-1')
  })
})




