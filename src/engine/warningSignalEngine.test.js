import { describe, expect, it } from 'vitest'
import { WARNING_SIGNAL_COPY } from '../content/clinicalCopy'
import { evaluateWarningSignals } from './warningSignalEngine'

describe('warningSignalEngine', () => {
  it('retorna estado calmo quando nenhum sinal foi marcado', () => {
    expect(evaluateWarningSignals({})).toEqual({
      level: 'calm',
      title: WARNING_SIGNAL_COPY.calm.title,
      message: WARNING_SIGNAL_COPY.calm.message,
      alertKey: '',
    })
  })

  it('trata perda isolada do tampão como observação', () => {
    expect(evaluateWarningSignals({ mucusPlug: true })).toEqual({
      level: 'attention',
      title: WARNING_SIGNAL_COPY.mucusPlug.title,
      message: WARNING_SIGNAL_COPY.mucusPlug.message,
      alertKey: '',
    })
  })

  it('eleva para alerta crítico quando há sinal maior', () => {
    expect(evaluateWarningSignals({ bleeding: true })).toEqual({
      level: 'critical',
      title: WARNING_SIGNAL_COPY.critical.title,
      message: WARNING_SIGNAL_COPY.critical.message,
      alertKey: 'warning-signal-critical',
    })
  })
})
