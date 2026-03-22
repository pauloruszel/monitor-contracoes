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

export function getLastItems(items, size) {
  return items.slice(Math.max(0, items.length - size))
}

export function normalizeContractions(contractions) {
  return contractions.map((contraction) => ({
    ...contraction,
    start: new Date(contraction.start),
    end: new Date(contraction.end),
  }))
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
