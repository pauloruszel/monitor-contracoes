export function startContraction() {
  return {
    id: crypto.randomUUID(),
    start: new Date(),
    wellbeing: 'green',
  }
}

export function endContraction(activeContraction) {
  const end = new Date()
  return {
    id: activeContraction.id,
    start: activeContraction.start,
    end,
    durationSeconds: getContractionDuration(activeContraction.start, end),
    wellbeing: activeContraction.wellbeing || 'green',
  }
}

export function getContractionDuration(start, end) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
}

export function getCurrentContractionDuration(start, now) {
  return Math.max(0, Math.round((now - start.getTime()) / 1000))
}

export function getIntervals(contractions) {
  if (contractions.length < 2) return []
  return contractions.slice(1).map((contraction, index) => {
    const previous = contractions[index]
    return Math.round((contraction.start.getTime() - previous.start.getTime()) / 1000)
  })
}

export function getAverageDuration(contractions) {
  if (contractions.length === 0) return 0
  const total = contractions.reduce((sum, contraction) => sum + contraction.durationSeconds, 0)
  return Math.round(total / contractions.length)
}

export function getAverageInterval(contractions) {
  const intervals = getIntervals(contractions)
  if (intervals.length === 0) return 0
  const total = intervals.reduce((sum, interval) => sum + interval, 0)
  return Math.round(total / intervals.length)
}

export function getContractionsInLastMinutes(contractions, minutes, now = new Date()) {
  if (!minutes || minutes <= 0) return []

  const nowDate = now instanceof Date ? now : new Date(now)
  const threshold = nowDate.getTime() - minutes * 60 * 1000

  return contractions.filter((contraction) => {
    const startDate =
      contraction.start instanceof Date ? contraction.start : new Date(contraction.start)

    return startDate.getTime() >= threshold && startDate.getTime() <= nowDate.getTime()
  })
}

export function getAverageDurationFromList(contractions) {
  return getAverageDuration(contractions)
}

export function getAverageIntervalFromList(contractions) {
  return getAverageInterval(contractions)
}

export function getIntervalTrend(currentWindow, previousWindow) {
  const currentAverage = getAverageIntervalFromList(currentWindow)
  const previousAverage = getAverageIntervalFromList(previousWindow)

  if (!currentAverage || !previousAverage) {
    return {
      label: 'insufficient_data',
      deltaSeconds: 0,
      currentAverage,
      previousAverage,
    }
  }

  const deltaSeconds = currentAverage - previousAverage

  if (Math.abs(deltaSeconds) <= 30) {
    return {
      label: 'stable',
      deltaSeconds,
      currentAverage,
      previousAverage,
    }
  }

  return {
    label: deltaSeconds < 0 ? 'shortening' : 'spacing',
    deltaSeconds,
    currentAverage,
    previousAverage,
  }
}

export function getTrendLabel(currentValue, previousValue, threshold = 30, direction = 'decrease') {
  if (!currentValue || !previousValue) {
    return 'insufficient_data'
  }

  const delta = currentValue - previousValue

  if (Math.abs(delta) <= threshold) {
    return 'stable'
  }

  if (direction === 'decrease') {
    return delta < 0 ? 'decreasing' : 'increasing'
  }

  return delta > 0 ? 'increasing' : 'decreasing'
}

export function getPatternRegularity(intervals) {
  if (!intervals || intervals.length < 3) {
    return {
      label: 'insufficient_data',
      spreadSeconds: 0,
      averageInterval: intervals?.length
        ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length)
        : 0,
    }
  }

  const min = Math.min(...intervals)
  const max = Math.max(...intervals)
  const spreadSeconds = max - min
  const averageInterval = Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length)

  return {
    label: spreadSeconds <= 60 ? 'regular' : 'irregular',
    spreadSeconds,
    averageInterval,
  }
}

export function buildTrendSummary({ metrics1h, metrics2h }) {
  const intervalTrend = getIntervalTrend(metrics1h.contractions, metrics2h.contractions)
  const durationTrendLabel = getTrendLabel(
    metrics1h.averageDuration,
    metrics2h.averageDuration,
    10,
    'increase',
  )
  const regularity = getPatternRegularity(metrics1h.intervals)

  let summaryLabel = 'Sem dados suficientes para interpretar a tendência.'

  if (intervalTrend.label === 'shortening' && regularity.label === 'regular') {
    summaryLabel = 'Padrão encurtando e mais consistente.'
  } else if (intervalTrend.label === 'shortening') {
    summaryLabel = 'Padrão encurtando nas últimas medições.'
  } else if (intervalTrend.label === 'spacing') {
    summaryLabel = 'Padrão espaçando em relação à janela anterior.'
  } else if (intervalTrend.label === 'stable' && regularity.label === 'regular') {
    summaryLabel = 'Padrão estável e consistente.'
  } else if (intervalTrend.label === 'stable') {
    summaryLabel = 'Padrão estável, sem mudança importante por enquanto.'
  }

  return {
    intervalTrend,
    durationTrend: {
      label: durationTrendLabel,
      currentAverage: metrics1h.averageDuration,
      previousAverage: metrics2h.averageDuration,
      deltaSeconds: metrics1h.averageDuration - metrics2h.averageDuration,
    },
    regularity,
    summaryLabel,
  }
}

export function getLastItems(items, size) {
  return items.slice(Math.max(0, items.length - size))
}

export function normalizeContractions(contractions) {
  return contractions
    .map((contraction) => ({
      ...contraction,
      start: new Date(contraction.start),
      end: new Date(contraction.end),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function formatDuration(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return '--'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function formatClockTime(value) {
  if (!value) return '--'
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getWellbeingSummary(contractions, size = 3) {
  const recent = getLastItems(contractions, size)
  const counts = recent.reduce(
    (acc, item) => {
      const key = item.wellbeing || 'green'
      acc[key] += 1
      return acc
    },
    { green: 0, yellow: 0, red: 0 },
  )

  if (recent.length === 0) {
    return {
      dominant: 'green',
      label: 'Sem registros de conforto ainda.',
    }
  }

  if (counts.red > 0) {
    return {
      dominant: 'red',
      label: `Últimas ${recent.length}: ${counts.red} com muita dor.`,
    }
  }

  if (counts.yellow > 0) {
    return {
      dominant: 'yellow',
      label: `Últimas ${recent.length}: ${counts.yellow} com mais desconforto.`,
    }
  }

  return {
    dominant: 'green',
    label: `Últimas ${recent.length}: lidando bem entre as contrações.`,
  }
}
