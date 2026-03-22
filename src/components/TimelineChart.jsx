import React from 'react'

const markers = [
  { label: '15 min', value: 15 },
  { label: '10 min', value: 10 },
  { label: '7 min', value: 7 },
  { label: '5 min', value: 5 },
  { label: '3 min', value: 3 },
]

const zoneStops = [
  { label: 'Pródromos', min: 10, max: 16, color: '#92a8d1' },
  { label: 'Latente', min: 5, max: 10, color: '#f2c66d' },
  { label: 'Ativa', min: 3, max: 5, color: '#f28c52' },
  { label: 'Transição', min: 0, max: 3, color: '#d9534f' },
]

const visualOnlyPhases = ['Expulsivo', 'Placenta']

const WIDTH = 100
const HEIGHT = 158
const plotLeft = 16
const plotRight = 86

function getY(minutes) {
  const clamped = Math.max(0, Math.min(15, minutes))
  return 128 - (clamped / 15) * 96
}

function getX(index, total) {
  if (total <= 1) return 50
  return plotLeft + (index / (total - 1)) * (plotRight - plotLeft)
}

function TimelineChart({ contractions, averageInterval, formatDuration, formatClockTime, intervals }) {
  const points = contractions.map((contraction, index) => {
    const intervalSeconds = intervals[index - 1] || null
    const intervalMinutes = intervalSeconds ? intervalSeconds / 60 : 15
    return {
      x: getX(index, contractions.length),
      y: getY(intervalMinutes),
      contraction,
      intervalSeconds,
    }
  })

  const markerY = averageInterval ? getY(averageInterval / 60) : null

  return (
    <section className="card timeline-card">
      <div className="card-header">
        <h2>Timeline das contrações</h2>
        <span className="badge badge-muted">Tempo entre inícios</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="timeline-svg" role="img">
        <rect x="10" y="12" width="80" height="118" rx="12" fill="#fff7eb" />

        {zoneStops.map((zone) => {
          const yTop = getY(zone.max)
          const yBottom = getY(zone.min)
          return (
            <g key={zone.label}>
              <rect
                x="12"
                y={yTop}
                width="76"
                height={Math.max(10, yBottom - yTop)}
                rx="8"
                fill={zone.color}
                opacity="0.18"
              />
              <text x="14" y={yTop + 10} className="timeline-zone-label">
                {zone.label}
              </text>
            </g>
          )
        })}

        {markers.map((marker) => (
          <g key={marker.label}>
            <line
              x1="12"
              x2="88"
              y1={getY(marker.value)}
              y2={getY(marker.value)}
              stroke="#d0d6e0"
              strokeDasharray="2 2"
            />
            <text x="90" y={getY(marker.value) + 4} className="timeline-axis-label">
              {marker.label}
            </text>
          </g>
        ))}

        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="#183153"
            strokeWidth="2"
            points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          />
        )}

        {points.map((point, index) => (
          <g key={point.contraction.id}>
            <circle cx={point.x} cy={point.y} r="3" fill="#f28c52">
              <title>
                {`Contração ${index + 1} - ${formatClockTime(point.contraction.start)} | duração ${formatDuration(
                  point.contraction.durationSeconds,
                )} | intervalo ${point.intervalSeconds ? formatDuration(point.intervalSeconds) : '--'}`}
              </title>
            </circle>
          </g>
        ))}

        {markerY ? (
          <g>
            <line x1="10" x2="90" y1={markerY} y2={markerY} stroke="#183153" strokeWidth="1.5" />
            <text x="14" y={markerY - 4} className="timeline-current-label">
              Média atual
            </text>
          </g>
        ) : null}
      </svg>
      <div className="timeline-legend">
        <span className="legend-chip">Pródromos</span>
        <span className="legend-chip">Latente</span>
        <span className="legend-chip">Ativa</span>
        <span className="legend-chip">Transição</span>
        {visualOnlyPhases.map((label) => (
          <span className="legend-chip legend-chip-muted" key={label}>
            {label}
          </span>
        ))}
      </div>
    </section>
  )
}

export default TimelineChart
