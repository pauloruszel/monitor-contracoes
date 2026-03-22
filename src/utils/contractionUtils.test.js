import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  endContraction,
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageInterval,
  getContractionDuration,
  getCurrentContractionDuration,
  getIntervals,
  getLastItems,
  getWellbeingSummary,
  normalizeContractions,
  startContraction,
} from './contractionUtils'

describe('contractionUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('startContraction cria id e horario de inicio', () => {
    const fixedDate = new Date('2026-03-21T10:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
    const randomSpy = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('abc-123')

    const result = startContraction()

    expect(result).toEqual({
      id: 'abc-123',
      start: fixedDate,
      wellbeing: 'green',
    })

    randomSpy.mockRestore()
    vi.useRealTimers()
  })

  it('endContraction finaliza a contracao com duracao', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-21T10:01:10.000Z'))
    const active = { id: '1', start: new Date('2026-03-21T10:00:00.000Z') }

    const result = endContraction(active)

    expect(result.id).toBe('1')
    expect(result.start).toEqual(active.start)
    expect(result.end).toEqual(new Date('2026-03-21T10:01:10.000Z'))
    expect(result.durationSeconds).toBe(70)
    expect(result.wellbeing).toBe('green')
    vi.useRealTimers()
  })

  it('getContractionDuration nunca retorna negativo', () => {
    const start = new Date('2026-03-21T10:01:00.000Z')
    const end = new Date('2026-03-21T10:00:00.000Z')
    expect(getContractionDuration(start, end)).toBe(0)
  })

  it('getCurrentContractionDuration calcula duracao corrente', () => {
    const start = new Date('2026-03-21T10:00:00.000Z')
    const now = new Date('2026-03-21T10:00:12.000Z').getTime()
    expect(getCurrentContractionDuration(start, now)).toBe(12)
  })

  it('getIntervals retorna vazio com menos de duas contracoes', () => {
    expect(getIntervals([])).toEqual([])
    expect(getIntervals([{ start: new Date('2026-03-21T10:00:00.000Z') }])).toEqual([])
  })

  it('getIntervals calcula intervalos entre inicios', () => {
    const contractions = [
      { start: new Date('2026-03-21T10:00:00.000Z') },
      { start: new Date('2026-03-21T10:05:00.000Z') },
      { start: new Date('2026-03-21T10:09:30.000Z') },
    ]

    expect(getIntervals(contractions)).toEqual([300, 270])
  })

  it('getAverageDuration e getAverageInterval tratam lista vazia e calculo medio', () => {
    expect(getAverageDuration([])).toBe(0)
    expect(getAverageInterval([])).toBe(0)

    const contractions = [
      { start: new Date('2026-03-21T10:00:00.000Z'), durationSeconds: 40 },
      { start: new Date('2026-03-21T10:05:00.000Z'), durationSeconds: 50 },
      { start: new Date('2026-03-21T10:09:00.000Z'), durationSeconds: 60 },
    ]

    expect(getAverageDuration(contractions)).toBe(50)
    expect(getAverageInterval(contractions)).toBe(270)
  })

  it('getLastItems retorna janela final respeitando o tamanho', () => {
    expect(getLastItems([1, 2, 3, 4], 2)).toEqual([3, 4])
    expect(getLastItems([1, 2], 5)).toEqual([1, 2])
  })

  it('normalizeContractions converte datas serializadas', () => {
    const result = normalizeContractions([
      {
        id: '1',
        start: '2026-03-21T10:00:00.000Z',
        end: '2026-03-21T10:00:45.000Z',
        durationSeconds: 45,
      },
    ])

    expect(result[0].start).toBeInstanceOf(Date)
    expect(result[0].end).toBeInstanceOf(Date)
  })

  it('getWellbeingSummary resume os ultimos estados', () => {
    expect(getWellbeingSummary([])).toEqual({
      dominant: 'green',
      label: 'Sem registros de conforto ainda.',
    })

    expect(
      getWellbeingSummary([
        { wellbeing: 'green' },
        { wellbeing: 'green' },
      ]),
    ).toEqual({
      dominant: 'green',
      label: 'Últimas 2: lidando bem entre as contrações.',
    })

    expect(
      getWellbeingSummary([
        { wellbeing: 'green' },
        { wellbeing: 'yellow' },
        { wellbeing: 'green' },
      ]),
    ).toEqual({
      dominant: 'yellow',
      label: 'Últimas 3: 1 com mais desconforto.',
    })

    expect(
      getWellbeingSummary([
        { wellbeing: 'green' },
        { wellbeing: 'yellow' },
        { wellbeing: 'red' },
      ]),
    ).toEqual({
      dominant: 'red',
      label: 'Últimas 3: 1 com muita dor.',
    })
  })

  it('formatDuration cobre null, undefined, segundos e minutos', () => {
    expect(formatDuration(null)).toBe('--')
    expect(formatDuration(undefined)).toBe('--')
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(42)).toBe('42s')
    expect(formatDuration(125)).toBe('2m 05s')
  })

  it('formatClockTime trata valor ausente e datas validas', () => {
    expect(formatClockTime(null)).toBe('--')
    expect(formatClockTime(new Date('2026-03-21T10:07:00.000Z'))).toMatch(/10:07|07:07|13:07/)
    expect(formatClockTime('2026-03-21T10:08:00.000Z')).toMatch(/10:08|07:08|13:08/)
  })
})
