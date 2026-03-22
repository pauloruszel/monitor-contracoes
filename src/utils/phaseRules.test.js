import { describe, expect, it } from 'vitest'
import { getPhaseFromMetrics, getRecommendationFromPhase } from './phaseRules'

function makeContractions(count) {
  return Array.from({ length: count }, (_, index) => ({ id: `${index}` }))
}

describe('phaseRules', () => {
  it('retorna poucos dados quando ainda nao ha base suficiente', () => {
    const result = getPhaseFromMetrics({
      contractions: makeContractions(1),
      intervals: [],
      averageDuration: 0,
      averageInterval: 0,
    })

    expect(result.key).toBe('prodomos')
    expect(result.patternLabel).toBe('Poucos dados')
    expect(result.alertKey).toBe('')
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
})
