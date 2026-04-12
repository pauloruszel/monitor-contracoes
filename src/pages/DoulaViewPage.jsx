import React, { useEffect, useMemo, useState } from 'react'
import DecisionCard from '../components/DecisionCard'
import CollapsibleSection from '../components/CollapsibleSection'
import MetricsCard from '../components/MetricsCard'
import SessionContextSummaryCard from '../components/SessionContextSummaryCard'
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
import { getSessionDecision } from '../engine/decisionEngine'
import { mapDecisionToDecisionCardViewModel } from '../adapters/decisionViewModel'
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
    mucusPlug: Boolean(row.mucusPlug),
    watersBroken: Boolean(row.watersBroken),
    meconium: Boolean(row.meconium),
    reducedMovement: Boolean(row.reducedMovement),
    bleeding: Boolean(row.bleeding),
    badSmellOrFever: Boolean(row.badSmellOrFever),
    preterm: Boolean(row.preterm),
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
      label: 'Sem conex\u00e3o',
      description: 'O celular ficou offline. Os dados podem parar de atualizar.',
    }
  }

  if (lastSuccessAt && Date.now() - lastSuccessAt > STALE_AFTER_MS) {
    return {
      tone: 'warning',
      label: 'Pode estar desatualizado',
      description: 'Faz algum tempo que nada atualiza. Vale conferir a conex\u00e3o.',
    }
  }

  if (realtimeConnected) {
    return {
      tone: 'calm',
      label: 'Ao vivo',
      description: 'As novas marca\u00e7\u00f5es chegam quase na hora.',
    }
  }

  return {
    tone: 'attention',
    label: 'Conectando',
    description: 'Tentando retomar a atualiza\u00e7\u00e3o da sess\u00e3o.',
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
      setContractions(mapContractions(Object.values(nextSession.contractions || {})))
      setWarningSignals(mapWarningSignalsRow(nextSession.warningSignals))
      setLastSuccessAt(Date.now())
    }

    async function load() {
      try {
        setLoading(true)
        const foundSession = await getSessionByShareToken(shareToken)
        applySessionSnapshot(foundSession)
        setError('')
        setRealtimeConnected(true)

        unsubscribe = subscribeToSession(foundSession.id, (event) => {
          setRealtimeConnected(true)
          setIsOnline(true)
          applySessionSnapshot(event.payload)
        })
      } catch {
        setRealtimeConnected(false)
        setError('N\u00e3o foi poss\u00edvel carregar esta sess\u00e3o compartilhada.')
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

  const sessionContext = session?.sessionContext || {}
  const userProfile = session?.userProfile || {}
  const clinicalPreferences = session?.clinicalPreferences || {}

  const decision = useMemo(
    () =>
      getSessionDecision({
        contractions: recentContractions,
        intervals,
        averageDuration,
        averageInterval,
        trendSummary,
        warningSignals,
        sessionContext,
        userProfile,
        clinicalPreferences,
      }),
    [
      recentContractions,
      intervals,
      averageDuration,
      averageInterval,
      trendSummary,
      warningSignals,
      sessionContext,
      userProfile,
      clinicalPreferences,
    ],
  )

  const { warningSignal, decision: decisionMeta } = decision
  const screenUrgency = decisionMeta.urgency

  const syncStatus = useMemo(
    () =>
      getSyncStatusView({
        isOnline,
        realtimeConnected,
        lastSuccessAt,
      }),
    [isOnline, realtimeConnected, lastSuccessAt, statusTick],
  )

  const metrics = useMemo(
    () => ({
      totalContractions: contractions.length,
      averageDuration,
      averageInterval,
      lastDuration:
        contractions.length > 0 ? contractions[contractions.length - 1].durationSeconds : null,
      lastInterval: intervals.length > 0 ? intervals[intervals.length - 1] : null,
      trendSummary,
    }),
    [contractions, averageDuration, averageInterval, intervals, trendSummary],
  )

  const decisionViewModel = useMemo(
    () =>
      mapDecisionToDecisionCardViewModel({
        decision,
        metrics,
        trendSummary,
        formatDuration,
      }),
    [decision, metrics, trendSummary],
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

  return (
    <div className={`app-shell app-shell-${screenUrgency}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">Modo doula</p>
          <h1>Acompanhamento da sess\u00e3o</h1>
          <p className="hero-copy">Visualizacao somente leitura das marcacoes da acompanhante.</p>
          <p className="top-actions-help">
            {`\u00daltima atualizacao: ${
              session?.updatedAt ? formatClockTime(session.updatedAt) : '--'
            }.`}
            {session?.status === 'closed' ? ' Sessao encerrada.' : ' Sessao ativa.'}
          </p>
          <div className={`sync-status sync-status-${syncStatus.tone}`}>
            <strong>{syncStatus.label}</strong>
            <span>{syncStatus.description}</span>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <DecisionCard viewModel={decisionViewModel} />
        <WarningSignalsCard
          signals={warningSignals}
          onToggleSignal={() => {}}
          assessment={warningSignal}
          open
          onToggleOpen={() => {}}
          readOnly
        />
        <SessionContextSummaryCard
          sessionContext={sessionContext}
          userProfile={userProfile}
          clinicalPreferences={clinicalPreferences}
          mode="doula"
        />
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <CollapsibleSection
          title="Leitura temporal"
          description="Visualizacao detalhada da evolucao recente para leitura remota."
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
