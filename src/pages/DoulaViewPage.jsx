import React, { useEffect, useMemo, useState } from 'react'
import DecisionCard from '../components/DecisionCard'
import CollapsibleSection from '../components/CollapsibleSection'
import MetricsCard from '../components/MetricsCard'
import TimelineChart from '../components/TimelineChart'
import WarningSignalsCard from '../components/WarningSignalsCard'
import HistoryList from '../components/HistoryList'
import {
  buildTrendSummary,
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageDurationFromList,
  getAverageInterval,
  getAverageIntervalFromList,
  getContractionsInLastMinutes,
  getIntervals,
  getLastItems,
  normalizeContractions,
} from '../utils/contractionUtils'
import { getPhaseFromMetrics, getRecommendationFromPhase } from '../utils/phaseRules'
import { getWarningSignalAssessment } from '../utils/warningSignals'
import { getSessionByShareToken, subscribeToSession } from '../services/firebaseSharingService'

const ANALYSIS_WINDOW = 5
const STALE_AFTER_MS = 30000

const defaultSignals = {
  mucusPlug: false,
  watersBroken: false,
  meconium: false,
  reducedMovement: false,
  bleeding: false,
  badSmellOrFever: false,
  preterm: false,
}

function mapWarningSignalsRow(row) {
  if (!row) return defaultSignals
  return {
    mucusPlug: row.mucusPlug,
    watersBroken: row.watersBroken,
    meconium: row.meconium,
    reducedMovement: row.reducedMovement,
    bleeding: row.bleeding,
    badSmellOrFever: row.badSmellOrFever,
    preterm: row.preterm,
  }
}

function mapContractions(rows = []) {
  return normalizeContractions(
    rows.map((row) => ({
      id: row.id,
      start: row.start,
      end: row.end,
      durationSeconds: row.durationSeconds,
      wellbeing: row.wellbeing,
    })),
  )
}

function getSyncStatusView({ isOnline, realtimeConnected, lastSuccessAt }) {
  if (!isOnline) {
    return {
      tone: 'warning',
      label: 'Sem conexão',
      description: 'O celular ficou offline. Os dados podem parar de atualizar.',
    }
  }

  if (lastSuccessAt && Date.now() - lastSuccessAt > STALE_AFTER_MS) {
    return {
      tone: 'warning',
      label: 'Pode estar desatualizado',
      description: 'Faz algum tempo que nada atualiza. Vale conferir a conexão.',
    }
  }

  if (realtimeConnected) {
    return {
      tone: 'calm',
      label: 'Ao vivo',
      description: 'As novas marcações chegam quase na hora.',
    }
  }

  return {
    tone: 'attention',
    label: 'Conectando',
    description: 'Tentando retomar a atualização da sessão.',
  }
}

function DoulaViewPage({ shareToken }) {
  const [session, setSession] = useState(null)
  const [contractions, setContractions] = useState([])
  const [warningSignals, setWarningSignals] = useState(defaultSignals)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [lastSuccessAt, setLastSuccessAt] = useState(null)
  const [statusTick, setStatusTick] = useState(Date.now())

  useEffect(() => {
    const syncOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)

    return () => {
      window.removeEventListener('online', syncOnlineStatus)
      window.removeEventListener('offline', syncOnlineStatus)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setStatusTick(Date.now()), 5000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let unsubscribe = null

    function applySessionSnapshot(nextSession) {
      setSession(nextSession)
      setContractions(mapContractions(Object.values(nextSession?.contractions || {})))
      setWarningSignals(mapWarningSignalsRow(nextSession?.warningSignals))
      setLastSuccessAt(Date.now())
    }

    async function load() {
      try {
        setLoading(true)
        const foundSession = await getSessionByShareToken(shareToken)
        applySessionSnapshot(foundSession)
        setLastSuccessAt(Date.now())
        setError('')
        setRealtimeConnected(true)

        unsubscribe = subscribeToSession(foundSession.id, (event) => {
          setRealtimeConnected(true)
          setIsOnline(true)
          applySessionSnapshot(event.payload)
        })
      } catch {
        setRealtimeConnected(false)
        setError('Não foi possível carregar esta sessão compartilhada.')
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [shareToken])

  const recentContractions = useMemo(
    () => getLastItems(contractions, ANALYSIS_WINDOW),
    [contractions],
  )
  const contractions1h = useMemo(
    () => getContractionsInLastMinutes(contractions, 60, now),
    [contractions, now],
  )
  const contractions2h = useMemo(
    () => getContractionsInLastMinutes(contractions, 120, now),
    [contractions, now],
  )
  const intervals = useMemo(() => getIntervals(recentContractions), [recentContractions])
  const averageDuration = useMemo(() => getAverageDuration(recentContractions), [recentContractions])
  const averageInterval = useMemo(() => getAverageInterval(recentContractions), [recentContractions])
  const metrics1h = useMemo(
    () => ({
      contractions: contractions1h,
      intervals: getIntervals(contractions1h),
      averageDuration: getAverageDurationFromList(contractions1h),
      averageInterval: getAverageIntervalFromList(contractions1h),
    }),
    [contractions1h],
  )
  const metrics2h = useMemo(
    () => ({
      contractions: contractions2h,
      intervals: getIntervals(contractions2h),
      averageDuration: getAverageDurationFromList(contractions2h),
      averageInterval: getAverageIntervalFromList(contractions2h),
    }),
    [contractions2h],
  )
  const trendSummary = useMemo(
    () =>
      buildTrendSummary({
        metrics1h,
        metrics2h,
      }),
    [metrics1h, metrics2h],
  )
  const phase = useMemo(
    () =>
      getPhaseFromMetrics({
        contractions: recentContractions,
        intervals,
        averageDuration,
        averageInterval,
        trendSummary,
      }),
    [recentContractions, intervals, averageDuration, averageInterval, trendSummary],
  )
  const warningAssessment = useMemo(
    () => getWarningSignalAssessment(warningSignals),
    [warningSignals],
  )
  const recommendation = useMemo(() => {
    if (warningAssessment.level === 'critical' || warningAssessment.level === 'warning') {
      return {
        title: warningAssessment.title,
        message: warningAssessment.message,
        secondary: 'O alerta vem antes da leitura do ritmo.',
      }
    }
    return getRecommendationFromPhase(phase.key, { trendSummary })
  }, [phase.key, warningAssessment, trendSummary])

  const syncStatus = useMemo(
    () =>
      getSyncStatusView({
        isOnline,
        realtimeConnected,
        lastSuccessAt,
        statusTick,
      }),
    [isOnline, realtimeConnected, lastSuccessAt, statusTick],
  )

  if (loading) {
    return (
      <div className="app-shell">
        <p>Carregando acompanhamento da doula...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-shell">
        <p>{error}</p>
      </div>
    )
  }

  const metrics = {
    totalContractions: contractions.length,
    averageDuration,
    averageInterval,
    lastDuration: contractions.length ? contractions[contractions.length - 1].durationSeconds : null,
    lastInterval: intervals.length > 0 ? intervals[intervals.length - 1] : null,
    trendSummary,
  }
  const screenUrgency =
    warningAssessment.level === 'critical'
      ? 'critical'
      : warningAssessment.level === 'warning'
        ? 'warning'
        : phase.urgency

  return (
    <div className={`app-shell app-shell-${screenUrgency}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">Modo doula</p>
          <h1>Acompanhamento da sessão</h1>
          <p className="hero-copy">Visualização somente leitura das marcações do acompanhante.</p>
          <p className="top-actions-help">
            Última atualização: {session?.updatedAt ? formatClockTime(session.updatedAt) : '--'}.
            {session?.status === 'closed' ? ' Sessão encerrada.' : ' Sessão ativa.'}
          </p>
          <div className={`sync-status sync-status-${syncStatus.tone}`}>
            <strong>{syncStatus.label}</strong>
            <span>{syncStatus.description}</span>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <DecisionCard
          phase={phase}
          recommendation={recommendation}
          warningAssessment={warningAssessment}
          urgency={screenUrgency}
          trendSummary={trendSummary}
          metrics={metrics}
          formatDuration={formatDuration}
        />
        <WarningSignalsCard
          signals={warningSignals}
          onToggleSignal={() => {}}
          assessment={warningAssessment}
          open
          onToggleOpen={() => {}}
          readOnly
        />
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <CollapsibleSection
          title="Leitura temporal"
          description="Visualização detalhada da evolução recente para leitura remota."
          badge="Contexto"
          open={timelineOpen}
          onToggle={() => setTimelineOpen((current) => !current)}
          countLabel="timeline"
        >
          <TimelineChart
            contractions={contractions}
            averageInterval={averageInterval}
            formatDuration={formatDuration}
            formatClockTime={formatClockTime}
            intervals={getIntervals(contractions)}
          />
        </CollapsibleSection>
        <HistoryList
          contractions={contractions}
          intervals={getIntervals(contractions)}
          formatClockTime={formatClockTime}
          formatDuration={formatDuration}
          open={historyOpen}
          onToggleOpen={() => setHistoryOpen((current) => !current)}
        />
      </main>
    </div>
  )
}

export default DoulaViewPage
