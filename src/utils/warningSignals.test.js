import { describe, expect, it } from 'vitest'
import { WARNING_SIGNAL_COPY } from '../content/clinicalCopy'
import { getWarningSignalAssessment } from './warningSignals'

describe('warningSignals', () => {
  it('retorna estado calmo quando nenhum sinal foi marcado', () => {
    expect(getWarningSignalAssessment({})).toEqual({
      level: 'calm',
      title: WARNING_SIGNAL_COPY.calm.title,
      message: WARNING_SIGNAL_COPY.calm.message,
      alertKey: '',
    })
  })

  it('trata perda isolada do tampao como observacao', () => {
    expect(getWarningSignalAssessment({ mucusPlug: true })).toEqual({
      level: 'attention',
      title: WARNING_SIGNAL_COPY.mucusPlug.title,
      message: WARNING_SIGNAL_COPY.mucusPlug.message,
      alertKey: '',
    })
  })

  it('trata tampao antes de 37 semanas como alerta de aviso', () => {
    expect(getWarningSignalAssessment({ mucusPlug: true, preterm: true })).toEqual({
      level: 'warning',
      title: WARNING_SIGNAL_COPY.mucusPreterm.title,
      message: WARNING_SIGNAL_COPY.mucusPreterm.message,
      alertKey: 'warning-signal-mucus-preterm',
    })
  })

  it('trata bolsa rota isolada como contato imediato com a maternidade', () => {
    expect(getWarningSignalAssessment({ watersBroken: true })).toEqual({
      level: 'warning',
      title: WARNING_SIGNAL_COPY.watersBroken.title,
      message: WARNING_SIGNAL_COPY.watersBroken.message,
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
        title: WARNING_SIGNAL_COPY.critical.title,
        message: WARNING_SIGNAL_COPY.critical.message,
        alertKey: 'warning-signal-critical',
      })
    }
  })
})
