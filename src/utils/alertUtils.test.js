import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  requestNotificationPermission,
  triggerBrowserNotification,
  triggerSoundAlert,
  triggerVoiceAlert,
} from './alertUtils'

describe('alertUtils', () => {
  const originalNotification = globalThis.Notification
  const originalSpeechSynthesis = window.speechSynthesis
  const originalSpeechUtterance = globalThis.SpeechSynthesisUtterance
  const originalAudioContext = window.AudioContext
  const originalWebkitAudioContext = window.webkitAudioContext

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    if (originalNotification === undefined) {
      delete globalThis.Notification
    } else {
      globalThis.Notification = originalNotification
    }

    if (originalSpeechSynthesis === undefined) {
      delete window.speechSynthesis
    } else {
      window.speechSynthesis = originalSpeechSynthesis
    }

    if (originalSpeechUtterance === undefined) {
      delete globalThis.SpeechSynthesisUtterance
    } else {
      globalThis.SpeechSynthesisUtterance = originalSpeechUtterance
    }

    if (originalAudioContext === undefined) {
      delete window.AudioContext
    } else {
      window.AudioContext = originalAudioContext
    }

    if (originalWebkitAudioContext === undefined) {
      delete window.webkitAudioContext
    } else {
      window.webkitAudioContext = originalWebkitAudioContext
    }
  })

  it('requestNotificationPermission retorna unsupported sem Notification', async () => {
    delete globalThis.Notification
    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
  })

  it('requestNotificationPermission retorna granted quando ja autorizado', async () => {
    globalThis.Notification = class NotificationMock {}
    globalThis.Notification.permission = 'granted'
    await expect(requestNotificationPermission()).resolves.toBe('granted')
  })

  it('requestNotificationPermission delega para a API do navegador quando necessario', async () => {
    const requestPermission = vi.fn().mockResolvedValue('denied')
    globalThis.Notification = class NotificationMock {}
    globalThis.Notification.permission = 'default'
    globalThis.Notification.requestPermission = requestPermission

    await expect(requestNotificationPermission()).resolves.toBe('denied')
    expect(requestPermission).toHaveBeenCalledTimes(1)
  })

  it('triggerBrowserNotification ignora quando Notification nao existe', () => {
    delete globalThis.Notification
    expect(() => triggerBrowserNotification('Titulo', 'Corpo')).not.toThrow()
  })

  it('triggerBrowserNotification ignora quando permissao nao foi concedida', () => {
    const ctor = vi.fn()
    globalThis.Notification = ctor
    globalThis.Notification.permission = 'denied'

    triggerBrowserNotification('Titulo', 'Corpo')

    expect(ctor).not.toHaveBeenCalled()
  })

  it('triggerBrowserNotification cria notificacao quando permitido', () => {
    const ctor = vi.fn()
    globalThis.Notification = ctor
    globalThis.Notification.permission = 'granted'

    triggerBrowserNotification('Titulo', 'Corpo')

    expect(ctor).toHaveBeenCalledWith('Titulo', { body: 'Corpo' })
  })

  it('triggerVoiceAlert ignora ambiente sem speech synthesis ou mensagem vazia', () => {
    delete window.speechSynthesis
    expect(() => triggerVoiceAlert('Oi')).not.toThrow()

    const cancel = vi.fn()
    const speak = vi.fn()
    window.speechSynthesis = { cancel, speak }
    globalThis.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
      this.text = text
    }

    triggerVoiceAlert('')

    expect(cancel).not.toHaveBeenCalled()
    expect(speak).not.toHaveBeenCalled()
  })

  it('triggerVoiceAlert fala a mensagem em pt-BR', () => {
    const cancel = vi.fn()
    const speak = vi.fn()
    window.speechSynthesis = { cancel, speak }
    globalThis.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
      this.text = text
    }

    triggerVoiceAlert('Avisar a doula')

    expect(cancel).toHaveBeenCalledTimes(1)
    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0]
    expect(utterance.text).toBe('Avisar a doula')
    expect(utterance.lang).toBe('pt-BR')
    expect(utterance.rate).toBe(1)
  })

  it('triggerSoundAlert ignora quando nao ha AudioContext', () => {
    delete window.AudioContext
    delete window.webkitAudioContext
    expect(() => triggerSoundAlert()).not.toThrow()
  })

  it('triggerSoundAlert usa frequencia critica e fecha contexto ao terminar', () => {
    const exponentialRampToValueAtTime = vi.fn()
    const gain = {
      gain: { value: 0, exponentialRampToValueAtTime },
      connect: vi.fn(),
    }
    const oscillator = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }
    const context = {
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
      destination: {},
      currentTime: 1,
      close: vi.fn(),
    }
    const AudioContextMock = vi.fn(() => context)
    window.AudioContext = AudioContextMock

    triggerSoundAlert('critical')
    oscillator.onended()

    expect(AudioContextMock).toHaveBeenCalledTimes(1)
    expect(oscillator.type).toBe('sine')
    expect(oscillator.frequency.value).toBe(880)
    expect(oscillator.start).toHaveBeenCalledTimes(1)
    expect(oscillator.stop).toHaveBeenCalledWith(1.38)
    expect(exponentialRampToValueAtTime).toHaveBeenCalledTimes(2)
    expect(context.close).toHaveBeenCalledTimes(1)
  })

  it('triggerSoundAlert cobre frequencias warning e attention com fallback webkit', () => {
    const makeContext = () => {
      const gain = {
        gain: { value: 0, exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }
      const oscillator = {
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      }
      return {
        context: {
          createOscillator: vi.fn(() => oscillator),
          createGain: vi.fn(() => gain),
          destination: {},
          currentTime: 2,
          close: vi.fn(),
        },
        oscillator,
      }
    }

    delete window.AudioContext
    const warningSetup = makeContext()
    const attentionSetup = makeContext()
    const WebkitAudioContextMock = vi
      .fn()
      .mockImplementationOnce(() => warningSetup.context)
      .mockImplementationOnce(() => attentionSetup.context)
    window.webkitAudioContext = WebkitAudioContextMock

    triggerSoundAlert('warning')
    triggerSoundAlert()

    expect(warningSetup.oscillator.frequency.value).toBe(660)
    expect(attentionSetup.oscillator.frequency.value).toBe(540)
  })
})
