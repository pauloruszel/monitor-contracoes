import { describe, expect, it } from 'vitest'
import { getWarningSignalAssessment } from './warningSignals'

describe('warningSignals', () => {
  it('retorna estado calmo quando nenhum sinal foi marcado', () => {
    expect(getWarningSignalAssessment({})).toEqual({
      level: 'calm',
      title: 'Sem alerta adicional',
      message: 'Nenhum sinal de alerta adicional foi marcado até agora.',
      alertKey: '',
    })
  })

  it('trata perda isolada do tampao como observacao', () => {
    expect(getWarningSignalAssessment({ mucusPlug: true })).toEqual({
      level: 'attention',
      title: 'Observar',
      message:
        'Perda do tampão isoladamente pode acontecer antes do trabalho de parto e não exige ida imediata ao hospital.',
      alertKey: '',
    })
  })

  it('trata tampao antes de 37 semanas como alerta de aviso', () => {
    expect(getWarningSignalAssessment({ mucusPlug: true, preterm: true })).toEqual({
      level: 'warning',
      title: 'Avisar a equipe',
      message:
        'Perda do tampão antes de 37 semanas merece avaliação. Falem com a equipe ou maternidade.',
      alertKey: 'warning-signal-mucus-preterm',
    })
  })

  it('trata bolsa rota isolada como contato imediato com a maternidade', () => {
    expect(getWarningSignalAssessment({ watersBroken: true })).toEqual({
      level: 'warning',
      title: 'Entrar em contato com a maternidade',
      message:
        'A bolsa pode ter rompido. Entrem em contato com a maternidade ou com a equipe para orientação agora.',
      alertKey: 'warning-signal-waters',
    })
  })

  it('eleva para critico em sinais maiores ou bolsa rota pre-termo', () => {
    for (const signals of [
      { meconium: true },
      { reducedMovement: true },
      { bleeding: true },
      { badSmellOrFever: true },
      { watersBroken: true, preterm: true },
    ]) {
      expect(getWarningSignalAssessment(signals)).toEqual({
        level: 'critical',
        title: 'Ir ao hospital / procurar atendimento',
        message:
          'Há um sinal de alerta importante. Procurem atendimento imediatamente ou falem com a equipe agora.',
        alertKey: 'warning-signal-critical',
      })
    }
  })
})
