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
        <Metric label="Duração média recente" value={formatDuration(metrics.averageDuration)} />
        <Metric label="Intervalo médio recente" value={formatDuration(metrics.averageInterval)} />
        <Metric
          label="Última duração"
          value={metrics.lastDuration ? formatDuration(metrics.lastDuration) : '--'}
        />
        <Metric
          label="Último intervalo"
          value={metrics.lastInterval ? formatDuration(metrics.lastInterval) : '--'}
        />
      </div>
      {metrics.trendSummary ? (
        <p className="support-text metrics-trend">Tendência: {metrics.trendSummary.summaryLabel}</p>
      ) : null}
      <p className="support-text">
        A leitura principal usa uma janela móvel das últimas 5 contrações. O total registrado considera
        todo o histórico da sessão.
      </p>
    </section>
  )
}

export default MetricsCard
