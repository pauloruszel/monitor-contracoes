import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearStorage,
  defaultClinicalPreferences,
  defaultSessionContext,
  defaultUserProfile,
  defaultWarningSignals,
  loadFromStorage,
  saveToStorage,
} from './storage'

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
      warningSignals: defaultWarningSignals,
      sessionContext: defaultSessionContext,
      userProfile: defaultUserProfile,
      clinicalPreferences: defaultClinicalPreferences,
    })
  })

  it('loadFromStorage retorna dado valido salvo', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"ok":true}')
    expect(loadFromStorage()).toEqual({
      contractions: [],
      activeContraction: null,
      doulaPhone: '5521981688856',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: defaultWarningSignals,
      sessionContext: defaultSessionContext,
      userProfile: defaultUserProfile,
      clinicalPreferences: defaultClinicalPreferences,
      ok: true,
    })
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
      warningSignals: defaultWarningSignals,
      sessionContext: defaultSessionContext,
      userProfile: defaultUserProfile,
      clinicalPreferences: defaultClinicalPreferences,
    })
  })

  it('loadFromStorage mescla defaults novos com dados salvos antigos', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"doulaPhone":"5511999999999"}')

    expect(loadFromStorage()).toEqual({
      contractions: [],
      activeContraction: null,
      doulaPhone: '5511999999999',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: defaultWarningSignals,
      sessionContext: defaultSessionContext,
      userProfile: defaultUserProfile,
      clinicalPreferences: defaultClinicalPreferences,
    })
  })

  it('loadFromStorage migra sessionNotes legado para sessionContext.notes', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"sessionNotes":"teste legado"}')

    expect(loadFromStorage().sessionContext).toEqual({
      ...defaultSessionContext,
      notes: 'teste legado',
    })
  })

  it('clearStorage remove a chave persistida', () => {
    localStorage.setItem('monitor-contracoes:v1', '{"ok":true}')
    clearStorage()
    expect(localStorage.getItem('monitor-contracoes:v1')).toBeNull()
  })
})
