import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildTrendSummary,
  endContraction,
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageDurationFromList,
  getAverageInterval,
  getAverageIntervalFromList,
  getContractionDuration,
  getContractionsInLastMinutes,
  getCurrentContractionDuration,
  getIntervalTrend,
  getIntervals,
  getLastItems,
  getPatternRegularity,
  getTrendLabel,
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

  it('getContractionsInLastMinutes filtra por janela temporal real', () => {
    const now = new Date('2026-03-21T10:30:00.000Z')
    const contractions = normalizeContractions([
      {
        id: '1',
        start: '2026-03-21T09:20:00.000Z',
        end: '2026-03-21T09:20:45.000Z',
        durationSeconds: 45,
      },
      {
        id: '2',
        start: '2026-03-21T09:45:00.000Z',
        end: '2026-03-21T09:45:50.000Z',
        durationSeconds: 50,
      },
      {
        id: '3',
        start: '2026-03-21T10:10:00.000Z',
        end: '2026-03-21T10:10:55.000Z',
        durationSeconds: 55,
      },
    ])

    expect(getContractionsInLastMinutes(contractions, 60, now).map((item) => item.id)).toEqual([
      '2',
      '3',
    ])
    expect(getContractionsInLastMinutes(contractions, 25, now).map((item) => item.id)).toEqual([
      '3',
    ])
  })

  it('getAverageDurationFromList e getAverageIntervalFromList reaproveitam os calculos medios', () => {
    const contractions = [
      { start: new Date('2026-03-21T10:00:00.000Z'), durationSeconds: 40 },
      { start: new Date('2026-03-21T10:04:00.000Z'), durationSeconds: 50 },
      { start: new Date('2026-03-21T10:09:00.000Z'), durationSeconds: 60 },
    ]

    expect(getAverageDurationFromList(contractions)).toBe(50)
    expect(getAverageIntervalFromList(contractions)).toBe(270)
  })

  it('getIntervalTrend classifica encurtando, estavel, espacando e falta de dados', () => {
    const previousWindow = [
      { start: new Date('2026-03-21T08:00:00.000Z') },
      { start: new Date('2026-03-21T08:06:00.000Z') },
      { start: new Date('2026-03-21T08:12:00.000Z') },
    ]
    const stableWindow = [
      { start: new Date('2026-03-21T09:00:00.000Z') },
      { start: new Date('2026-03-21T09:06:20.000Z') },
      { start: new Date('2026-03-21T09:12:10.000Z') },
    ]
    const shorteningWindow = [
      { start: new Date('2026-03-21T10:00:00.000Z') },
      { start: new Date('2026-03-21T10:05:00.000Z') },
      { start: new Date('2026-03-21T10:10:00.000Z') },
    ]
    const spacingWindow = [
      { start: new Date('2026-03-21T11:00:00.000Z') },
      { start: new Date('2026-03-21T11:07:00.000Z') },
      { start: new Date('2026-03-21T11:14:00.000Z') },
    ]

    expect(getIntervalTrend(shorteningWindow, previousWindow)).toEqual({
      label: 'shortening',
      deltaSeconds: -60,
      currentAverage: 300,
      previousAverage: 360,
    })

    expect(getIntervalTrend(stableWindow, previousWindow)).toEqual({
      label: 'stable',
      deltaSeconds: 5,
      currentAverage: 365,
      previousAverage: 360,
    })

    expect(getIntervalTrend(spacingWindow, previousWindow)).toEqual({
      label: 'spacing',
      deltaSeconds: 60,
      currentAverage: 420,
      previousAverage: 360,
    })

    expect(getIntervalTrend([], previousWindow)).toEqual({
      label: 'insufficient_data',
      deltaSeconds: 0,
      currentAverage: 0,
      previousAverage: 360,
    })
  })

  it('getTrendLabel classifica queda, estabilidade, aumento e falta de dados', () => {
    expect(getTrendLabel(0, 100)).toBe('insufficient_data')
    expect(getTrendLabel(300, 360)).toBe('decreasing')
    expect(getTrendLabel(355, 360)).toBe('stable')
    expect(getTrendLabel(420, 360)).toBe('increasing')
    expect(getTrendLabel(60, 50, 5, 'increase')).toBe('increasing')
    expect(getTrendLabel(40, 50, 5, 'increase')).toBe('decreasing')
  })

  it('getPatternRegularity classifica padrao regular, irregular e falta de dados', () => {
    expect(getPatternRegularity([])).toEqual({
      label: 'insufficient_data',
      spreadSeconds: 0,
      averageInterval: 0,
    })

    expect(getPatternRegularity([300, 320, 310])).toEqual({
      label: 'regular',
      spreadSeconds: 20,
      averageInterval: 310,
    })

    expect(getPatternRegularity([240, 360, 420])).toEqual({
      label: 'irregular',
      spreadSeconds: 180,
      averageInterval: 340,
    })
  })

  it('buildTrendSummary consolida tendência e regularidade em uma saída única', () => {
    const metrics1h = {
      contractions: [
        { start: new Date('2026-03-21T10:00:00.000Z') },
        { start: new Date('2026-03-21T10:05:00.000Z') },
        { start: new Date('2026-03-21T10:10:00.000Z') },
        { start: new Date('2026-03-21T10:15:10.000Z') },
      ],
      intervals: [300, 300, 310],
      averageDuration: 58,
      averageInterval: 303,
    }
    const metrics2h = {
      contractions: [
        { start: new Date('2026-03-21T08:00:00.000Z') },
        { start: new Date('2026-03-21T08:06:00.000Z') },
        { start: new Date('2026-03-21T08:12:00.000Z') },
        { start: new Date('2026-03-21T08:18:00.000Z') },
      ],
      intervals: [360, 360, 360],
      averageDuration: 45,
      averageInterval: 360,
    }

    expect(buildTrendSummary({ metrics1h, metrics2h })).toEqual({
      intervalTrend: {
        label: 'shortening',
        deltaSeconds: -57,
        currentAverage: 303,
        previousAverage: 360,
      },
      durationTrend: {
        label: 'increasing',
        currentAverage: 58,
        previousAverage: 45,
        deltaSeconds: 13,
      },
      regularity: {
        label: 'regular',
        spreadSeconds: 10,
        averageInterval: 303,
      },
      summaryLabel: 'Padrão encurtando e mais consistente.',
    })
  })

  it('getLastItems retorna janela final respeitando o tamanho', () => {
    expect(getLastItems([1, 2, 3, 4], 2)).toEqual([3, 4])
    expect(getLastItems([1, 2], 5)).toEqual([1, 2])
  })

  it('normalizeContractions converte datas serializadas e ordena por inicio', () => {
    const result = normalizeContractions([
      {
        id: '2',
        start: '2026-03-21T10:05:00.000Z',
        end: '2026-03-21T10:05:45.000Z',
        durationSeconds: 45,
      },
      {
        id: '1',
        start: '2026-03-21T10:00:00.000Z',
        end: '2026-03-21T10:00:45.000Z',
        durationSeconds: 45,
      },
    ])

    expect(result[0].start).toBeInstanceOf(Date)
    expect(result[0].end).toBeInstanceOf(Date)
    expect(result.map((item) => item.id)).toEqual(['1', '2'])
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
