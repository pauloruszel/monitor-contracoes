import React from 'react'

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MetricsCard({ metrics, formatDuration }) {
  return (
    <section className="card metrics-card">
      <div className="card-header">
        <h2>Métricas</h2>
        <span className="badge badge-muted">{metrics.totalContractions} registradas</span>
      </div>
      <div className="metrics-grid">
        <Metric label="Duração média" value={formatDuration(metrics.averageDuration)} />
        <Metric label="Intervalo médio" value={formatDuration(metrics.averageInterval)} />
        <Metric
          label="Última duração"
          value={metrics.lastDuration ? formatDuration(metrics.lastDuration) : '--'}
        />
        <Metric
          label="Último intervalo"
          value={metrics.lastInterval ? formatDuration(metrics.lastInterval) : '--'}
        />
      </div>
      <p className="support-text">A análise principal usa uma janela móvel das últimas 5 contrações.</p>
    </section>
  )
}

export default MetricsCard
