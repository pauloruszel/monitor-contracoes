import React, { useEffect, useMemo, useState } from 'react'
import MetricsCard from '../components/MetricsCard'
import RecommendationCard from '../components/RecommendationCardV2'
import TimelineChart from '../components/TimelineChart'
import WarningSignalsCard from '../components/WarningSignalsCard'
import HistoryList from '../components/HistoryList'
import {
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageInterval,
  getIntervals,
  getLastItems,
  getWellbeingSummary,
  normalizeContractions,
} from '../utils/contractionUtils'
import { getPhaseFromMetrics, getRecommendationFromPhase } from '../utils/phaseRules'
import { getWarningSignalAssessment } from '../utils/warningSignals'
import {
  getContractionsBySession,
  getSessionByShareToken,
  getWarningSignalsBySession,
  subscribeToSession,
} from '../services/sharingService'

const ANALYSIS_WINDOW = 5
const POLL_INTERVAL_MS = 10000
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
    mucusPlug: row.mucus_plug,
    watersBroken: row.waters_broken,
    meconium: row.meconium,
    reducedMovement: row.reduced_movement,
    bleeding: row.bleeding,
    badSmellOrFever: row.bad_smell_or_fever,
    preterm: row.preterm,
  }
}

function mapContractions(rows) {
  return normalizeContractions(
    rows.map((row) => ({
      id: row.id,
      start: row.start_at,
      end: row.end_at,
      durationSeconds: row.duration_seconds,
      wellbeing: row.wellbeing,
    })),
  )
}

function getSyncStatusView({ isOnline, realtimeConnected, usingPolling, lastSuccessAt }) {
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

  if (usingPolling) {
    return {
      tone: 'attention',
      label: 'Atualização automática',
      description: 'A tela segue conferindo as novidades automaticamente em alguns segundos.',
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
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [usingPolling, setUsingPolling] = useState(false)
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
    let unsubscribe = null
    let pollTimer = null

    async function refreshSession(foundSession, reason = 'manual') {
      const [nextContractions, nextWarningSignals, nextSession] = await Promise.all([
        getContractionsBySession(foundSession.id),
        getWarningSignalsBySession(foundSession.id),
        getSessionByShareToken(shareToken),
      ])

      setContractions(mapContractions(nextContractions))
      setWarningSignals(mapWarningSignalsRow(nextWarningSignals))
      setSession(nextSession)
      setLastSuccessAt(Date.now())
      setIsOnline(true)

      if (reason === 'poll') {
        setUsingPolling(true)
      } else {
        setUsingPolling(false)
      }
    }

    async function load() {
      try {
        setLoading(true)
        const foundSession = await getSessionByShareToken(shareToken)
        const [contractionsRows, warningSignalsRow] = await Promise.all([
          getContractionsBySession(foundSession.id),
          getWarningSignalsBySession(foundSession.id),
        ])

        setSession(foundSession)
        setContractions(mapContractions(contractionsRows))
        setWarningSignals(mapWarningSignalsRow(warningSignalsRow))
        setLastSuccessAt(Date.now())
        setError('')

        unsubscribe = subscribeToSession(foundSession.id, async (event) => {
          if (event.source === 'subscription_status') {
            const connected = event.status === 'SUBSCRIBED'
            setRealtimeConnected(connected)
            if (!connected) {
              setUsingPolling(true)
            }
            return
          }

          try {
            setRealtimeConnected(true)
            await refreshSession(foundSession, 'realtime')
          } catch {
            setUsingPolling(true)
          }
        })

        pollTimer = window.setInterval(() => {
          refreshSession(foundSession, 'poll').catch(() => {
            setUsingPolling(true)
            setRealtimeConnected(false)
            setIsOnline(navigator.onLine)
          })
        }, POLL_INTERVAL_MS)
      } catch {
        setError('Não foi possível carregar esta sessão compartilhada.')
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => {
      if (unsubscribe) unsubscribe()
      if (pollTimer) window.clearInterval(pollTimer)
    }
  }, [shareToken])

  const recentContractions = useMemo(
    () => getLastItems(contractions, ANALYSIS_WINDOW),
    [contractions],
  )
  const intervals = useMemo(() => getIntervals(recentContractions), [recentContractions])
  const averageDuration = useMemo(() => getAverageDuration(recentContractions), [recentContractions])
  const averageInterval = useMemo(() => getAverageInterval(recentContractions), [recentContractions])
  const phase = useMemo(
    () =>
      getPhaseFromMetrics({
        contractions: recentContractions,
        intervals,
        averageDuration,
        averageInterval,
      }),
    [recentContractions, intervals, averageDuration, averageInterval],
  )
  const wellbeingSummary = useMemo(() => getWellbeingSummary(recentContractions), [recentContractions])
  const warningAssessment = useMemo(
    () => getWarningSignalAssessment(warningSignals),
    [warningSignals],
  )
  const recommendation = useMemo(() => {
    if (warningAssessment.level === 'critical' || warningAssessment.level === 'warning') {
      return {
        title: warningAssessment.title,
        message: warningAssessment.message,
        secondary: 'Este alerta tem prioridade sobre o tempo das contrações.',
      }
    }
    return getRecommendationFromPhase(phase.key)
  }, [phase.key, warningAssessment])

  const syncStatus = useMemo(
    () =>
      getSyncStatusView({
        isOnline,
        realtimeConnected,
        usingPolling,
        lastSuccessAt,
        statusTick,
      }),
    [isOnline, realtimeConnected, usingPolling, lastSuccessAt, statusTick],
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
    lastInterval: getIntervals(contractions).length ? getIntervals(contractions).at(-1) : null,
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Modo doula</p>
          <h1>Acompanhamento da sessão</h1>
          <p className="hero-copy">Visualização somente leitura das marcações do acompanhante.</p>
          <p className="top-actions-help">
            Última atualização: {session?.updated_at ? formatClockTime(session.updated_at) : '--'}.
            {session?.status === 'closed' ? ' Sessão encerrada.' : ' Sessão ativa.'}
          </p>
          <div className={`sync-status sync-status-${syncStatus.tone}`}>
            <strong>{syncStatus.label}</strong>
            <span>{syncStatus.description}</span>
          </div>
        </div>
        <div
          className={`status-pill status-${
            warningAssessment.level !== 'calm' ? warningAssessment.level : phase.urgency
          }`}
        >
          {warningAssessment.level !== 'calm' ? warningAssessment.title : phase.label}
        </div>
      </header>

      <main className="content-grid">
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <RecommendationCard
          phase={phase}
          recommendation={recommendation}
          urgency={warningAssessment.level !== 'calm' ? warningAssessment.level : phase.urgency}
          wellbeingSummary={wellbeingSummary}
          mode="doula"
        />
        <WarningSignalsCard
          signals={warningSignals}
          onToggleSignal={() => {}}
          assessment={warningAssessment}
          open
          onToggleOpen={() => {}}
          readOnly
        />
        <TimelineChart
          contractions={contractions}
          averageInterval={averageInterval}
          formatDuration={formatDuration}
          formatClockTime={formatClockTime}
          intervals={getIntervals(contractions)}
        />
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

