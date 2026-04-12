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
import { CLINICAL_PHASE_COPY } from '../content/clinicalCopy'

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
    const result = getPhaseFromMetrics({
      contractions: makeContractions(1),
      intervals: [],
      averageDuration: 0,
      averageInterval: 0,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toContain('Poucos')
    expect(result.alertKey).toBe('')
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
    expect(result.patternLabel).toContain('faixa latente')
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
    expect(result.patternLabel).toContain('intenso')
  })

  it('classifica fase ativa quando o intervalo esta entre 3 e 4 minutos com duracao suficiente', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [210, 220, 230],
      averageDuration: 45,
      averageInterval: 220,
    })

    expect(result.key).toBe('ativa')
    expect(result.urgency).toBe('warning')
    expect(result.alertKey).toBe('prepare-hospital')
    expect(result.patternLabel).toContain('consistente')
  })

  it('classifica fase ativa irregular quando ha grande variacao', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [60, 220, 260],
      averageDuration: 50,
      averageInterval: 180,
    })

    expect(result.key).toBe('ativa')
    expect(result.patternLabel).toContain('encurtando')
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

    expect(result.key).toBe('latente')
    expect(result.urgency).toBe('attention')
    expect(result.alertKey).toBe('call-doula')
    expect(result.patternLabel).toContain('faixa latente')
  })

  it('classifica fase latente irregular quando ha muita variacao', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [120, 360, 480],
      averageDuration: 35,
      averageInterval: 320,
    })

    expect(result.key).toBe('latente')
    expect(result.patternLabel).toContain('irregular')
  })

  it('mantem prodomos com intervalos altos e padrao irregular', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [480, 720, 900],
      averageDuration: 30,
      averageInterval: 700,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toContain('irregular')
  })

  it('mantem prodomos com intervalos espacados regulares', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(4),
      intervals: [600, 620, 610],
      averageDuration: 30,
      averageInterval: 610,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toContain('espa')
  })

  it('retorna recomendacoes para todas as fases e fallback', () => {
    expect(getRecommendationFromPhase('latente')).toMatchObject({
      title: CLINICAL_PHASE_COPY.latente.recommendation.title,
      alertMessage: CLINICAL_PHASE_COPY.latente.recommendation.alertMessage,
    })
    expect(getRecommendationFromPhase('ativa')).toMatchObject({
      title: CLINICAL_PHASE_COPY.ativa.recommendation.title,
      alertMessage: CLINICAL_PHASE_COPY.ativa.recommendation.alertMessage,
    })
    expect(getRecommendationFromPhase('transicao')).toMatchObject({
      title: CLINICAL_PHASE_COPY.transicao.recommendation.title,
      alertMessage: CLINICAL_PHASE_COPY.transicao.recommendation.alertMessage,
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
        patternLabel: 'Padrao espacado',
        description: 'Ainda parece inicio / prodromos.',
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

    expect(result.patternLabel).toContain('encurtando')
    expect(result.description).toContain('intervalos encurtando')
    expect(result.description).toContain('duracao')
    expect(result.description).toContain('parto rapido')
    expect(result.description).toContain('sensibilidade de alerta')
    expect(result.adjustmentReasons).toHaveLength(2)
    expect(result.adjustmentReasons[0]).toContain('parto')
    expect(result.adjustmentReasons[1]).toContain('sensibilidade')
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
    expect(result.secondary).toContain('encurtando')
    expect(result.secondary).toContain('parto')
    expect(result.alertMessage).toContain('Avisar a doula cedo.')
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

    expect(result.secondary).toContain('espa')
    expect(result.secondary).toContain('5-1-1')
  })
})
