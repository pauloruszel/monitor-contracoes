import React, { useEffect, useMemo, useState } from 'react'
import MetricsCard from '../components/MetricsCard'
import RecommendationCard from '../components/RecommendationCardV2'
import TimelineChart from '../components/TimelineChart'
import WarningSignalsCard from '../components/WarningSignalsCard'
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

function DoulaViewPage({ shareToken }) {
  const [session, setSession] = useState(null)
  const [contractions, setContractions] = useState([])
  const [warningSignals, setWarningSignals] = useState(defaultSignals)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [realtimeStatus, setRealtimeStatus] = useState('Conectando...')

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
      setRealtimeStatus((current) =>
        reason === 'poll'
          ? 'Atualizando por verificação automática.'
          : current.startsWith('Realtime')
            ? current
            : 'Atualizado em tempo real.',
      )
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

        unsubscribe = subscribeToSession(foundSession.id, async (event) => {
          if (event.source === 'subscription_status') {
            const nextStatus =
              event.status === 'SUBSCRIBED'
                ? 'Realtime conectado.'
                : `Realtime status: ${event.status}.`
            setRealtimeStatus(nextStatus)
            console.log('[doula-view] subscription status', event.status)
            return
          }

          console.log('[doula-view] realtime event', event.source, event.payload)
          await refreshSession(foundSession, 'realtime')
        })

        pollTimer = window.setInterval(() => {
          refreshSession(foundSession, 'poll').catch(() => {
            setRealtimeStatus('Falha na verificação automática.')
          })
        }, 10000)
      } catch {
        setError('Nao foi possivel carregar esta sessao compartilhada.')
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

  if (loading) {
    return <div className="app-shell"><p>Carregando acompanhamento da doula...</p></div>
  }

  if (error) {
    return <div className="app-shell"><p>{error}</p></div>
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
          <h1>Acompanhamento em tempo real</h1>
          <p className="hero-copy">
            Visualização somente leitura das marcações do acompanhante.
          </p>
          <p className="top-actions-help">
            Última atualização: {session?.updated_at ? formatClockTime(session.updated_at) : '--'}.
            {session?.status === 'closed' ? ' Sessão encerrada.' : ' Sessão ativa.'}
          </p>
          <p className="top-actions-help">{realtimeStatus}</p>
        </div>
        <div className={`status-pill status-${warningAssessment.level !== 'calm' ? warningAssessment.level : phase.urgency}`}>
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
          meta={{
            lastUpdated: session?.updated_at ? formatClockTime(session.updated_at) : '--',
            sessionStatus: session?.status === 'closed' ? 'Sessão encerrada.' : 'Sessão ativa.',
          }}
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
      </main>
    </div>
  )
}

export default DoulaViewPage
