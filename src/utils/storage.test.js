import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStorage, loadFromStorage, saveToStorage } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saveToStorage persiste os dados serializados', () => {
    saveToStorage({ foo: 'bar' })
    expect(localStorage.getItem('monitor-contracoes:v1')).toBe('{"foo":"bar"}')
  })

  it('loadFromStorage retorna default quando nao existe valor salvo', () => {
    expect(loadFromStorage()).toEqual({
      contractions: [],
      activeContraction: null,
      doulaPhone: '5521981688856',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: {
        mucusPlug: false,
        watersBroken: false,
        meconium: false,
        reducedMovement: false,
        bleeding: false,
        badSmellOrFever: false,
        preterm: false,
      },
    })
  })

  it('loadFromStorage retorna dado valido salvo', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"ok":true}')
    expect(loadFromStorage()).toEqual({ ok: true })
  })

  it('loadFromStorage volta ao default em caso de json invalido', () => {
    localStorage.setItem('monitor-contracoes:v1', '{invalido')
    expect(loadFromStorage()).toEqual({
      contractions: [],
      activeContraction: null,
      doulaPhone: '5521981688856',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: {
        mucusPlug: false,
        watersBroken: false,
        meconium: false,
        reducedMovement: false,
        bleeding: false,
        badSmellOrFever: false,
        preterm: false,
      },
    })
  })

  it('clearStorage remove a chave persistida', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"ok":true}')
    clearStorage()
    expect(localStorage.getItem('monitor-contracoes:v1')).toBeNull()
  })
})
