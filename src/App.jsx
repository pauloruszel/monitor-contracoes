import React, { useEffect, useMemo, useRef, useState } from 'react'
import CurrentContractionCard from './components/CurrentContractionCard'
import MetricsCard from './components/MetricsCard'
import RecommendationCard from './components/RecommendationCard'
import TimelineChart from './components/TimelineChart'
import HistoryList from './components/HistoryList'
import DoulaContactCard from './components/DoulaContactCard'
import GuidanceCard from './components/GuidanceCard'
import ManualModal from './components/ManualModal'
import WarningSignalsCard from './components/WarningSignalsCard'
import {
  endContraction,
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageInterval,
  getCurrentContractionDuration,
  getIntervals,
  getLastItems,
  getWellbeingSummary,
  normalizeContractions,
  startContraction,
} from './utils/contractionUtils'
import { getPhaseFromMetrics, getRecommendationFromPhase } from './utils/phaseRules'
import { clearStorage, loadFromStorage, saveToStorage } from './utils/storage'
import { getWarningSignalAssessment } from './utils/warningSignals'
import {
  requestNotificationPermission,
  triggerBrowserNotification,
  triggerSoundAlert,
  triggerVoiceAlert,
} from './utils/alertUtils'

const ANALYSIS_WINDOW = 5
const initialStored = loadFromStorage()

function App() {
  const [contractions, setContractions] = useState(() =>
    normalizeContractions(initialStored.contractions || []),
  )
  const [activeContraction, setActiveContraction] = useState(() =>
    initialStored.activeContraction
      ? { ...initialStored.activeContraction, start: new Date(initialStored.activeContraction.start) }
      : null,
  )
  const [doulaPhone, setDoulaPhone] = useState(initialStored.doulaPhone || '')
  const [alertsEnabled, setAlertsEnabled] = useState(Boolean(initialStored.alertsEnabled))
  const [lastAlertKey, setLastAlertKey] = useState(initialStored.lastAlertKey || '')
  const [warningSignals, setWarningSignals] = useState(
    initialStored.warningSignals || {
      mucusPlug: false,
      watersBroken: false,
      meconium: false,
      reducedMovement: false,
      bleeding: false,
      badSmellOrFever: false,
      preterm: false,
    },
  )
  const [manualOpen, setManualOpen] = useState(false)
  const [warningSignalsOpen, setWarningSignalsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    saveToStorage({
      contractions,
      activeContraction,
      doulaPhone,
      alertsEnabled,
      lastAlertKey,
      warningSignals,
    })
  }, [contractions, activeContraction, doulaPhone, alertsEnabled, lastAlertKey, warningSignals])

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

  const recommendation = useMemo(() => getRecommendationFromPhase(phase.key), [phase.key])
  const wellbeingSummary = useMemo(() => getWellbeingSummary(recentContractions), [recentContractions])
  const warningAssessment = useMemo(
    () => getWarningSignalAssessment(warningSignals),
    [warningSignals],
  )
  const currentDuration = activeContraction
    ? getCurrentContractionDuration(activeContraction.start, now)
    : 0
  const alertStateRef = useRef('')

  useEffect(() => {
    alertStateRef.current = lastAlertKey
  }, [lastAlertKey])

  useEffect(() => {
    const nextAlertKey = warningAssessment.alertKey || phase.alertKey
    const nextAlertMessage =
      warningAssessment.alertKey && warningAssessment.level !== 'calm'
        ? warningAssessment.message
        : recommendation.alertMessage
    const nextUrgency =
      warningAssessment.level === 'critical'
        ? 'critical'
        : warningAssessment.level === 'warning'
          ? 'warning'
          : phase.urgency

    if (!alertsEnabled || !nextAlertKey) return
    if (alertStateRef.current === nextAlertKey) return

    triggerBrowserNotification('Monitor de Contrações', nextAlertMessage)
    triggerVoiceAlert(nextAlertMessage)
    triggerSoundAlert(nextUrgency)
    setLastAlertKey(nextAlertKey)
  }, [
    alertsEnabled,
    warningAssessment.alertKey,
    warningAssessment.level,
    warningAssessment.message,
    phase.alertKey,
    phase.urgency,
    recommendation.alertMessage,
  ])

  const handleStartContraction = () => {
    if (activeContraction) return
    setActiveContraction(startContraction())
  }

  const handleEndContraction = () => {
    if (!activeContraction) return
    const completed = endContraction(activeContraction)
    setContractions((current) => [...current, completed])
    setActiveContraction(null)
  }

  const handleWellbeingChange = (wellbeing) => {
    setActiveContraction((current) => (current ? { ...current, wellbeing } : current))
  }

  const handleToggleAlerts = async () => {
    const nextValue = !alertsEnabled
    if (nextValue) await requestNotificationPermission()
    setAlertsEnabled(nextValue)
  }

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja resetar todos os dados salvos? Essa ação apaga o histórico, a contração em andamento e os alertas.',
    )

    if (!confirmed) return

    clearStorage()
    setContractions([])
    setActiveContraction(null)
    setDoulaPhone('5521981688856')
    setAlertsEnabled(false)
    setLastAlertKey('')
    setWarningSignals({
      mucusPlug: false,
      watersBroken: false,
      meconium: false,
      reducedMovement: false,
      bleeding: false,
      badSmellOrFever: false,
      preterm: false,
    })
  }

  const handleToggleSignal = (key) => {
    setWarningSignals((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const metrics = {
    totalContractions: contractions.length,
    averageDuration,
    averageInterval,
    lastDuration: contractions.length > 0 ? contractions[contractions.length - 1].durationSeconds : null,
    lastInterval: intervals.length > 0 ? intervals[intervals.length - 1] : null,
  }

  const recommendationView = useMemo(() => {
    if (warningAssessment.level === 'critical' || warningAssessment.level === 'warning') {
      return {
        title: warningAssessment.title,
        message: warningAssessment.message,
        secondary:
          'Esse alerta tem prioridade sobre a leitura do tempo das contrações e deve ser levado em conta imediatamente.',
        alertMessage: warningAssessment.message,
      }
    }

    if (wellbeingSummary.dominant === 'red') {
      return {
        ...recommendation,
        secondary:
          'Ela foi marcada com muita dor nas contrações recentes. Considere falar com a doula ou equipe agora.',
      }
    }

    if (wellbeingSummary.dominant === 'yellow' && phase.key === 'prodomos') {
      return {
        ...recommendation,
        secondary:
          'Mesmo ainda parecendo início, ela já está mais desconfortável. Observe com mais atenção e considere avisar a doula.',
      }
    }

    return recommendation
  }, [recommendation, wellbeingSummary, phase.key, warningAssessment])

  const whatsAppMessage = encodeURIComponent(
    [
      'Estamos monitorando as contrações.',
      `Contrações recentes: ${recentContractions.length}.`,
      `Duração média: ${formatDuration(averageDuration)}.`,
      `Intervalo médio: ${formatDuration(averageInterval)}.`,
      `Fase provável: ${phase.label}.`,
      `Recomendação: ${recommendation.title}. ${recommendation.message}`,
    ].join(' '),
  )
  const phoneDigits = doulaPhone.replace(/\D/g, '')
  const whatsAppUrl = phoneDigits ? `https://wa.me/${phoneDigits}?text=${whatsAppMessage}` : ''

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Trabalho de parto</p>
          <h1>Monitor de Contrações</h1>
          <p className="hero-copy">
            Registre as contrações, acompanhe a evolução e receba alertas práticos sem perder o foco.
          </p>
          <div className="top-actions">
            <button className="button button-manual" onClick={() => setManualOpen(true)}>
              Como usar
            </button>
            <button className="button button-top-alert" onClick={handleToggleAlerts}>
              {alertsEnabled ? 'Alertas automáticos: ligados' : 'Alertas automáticos: desligados'}
            </button>
            <button className="button button-reset" onClick={handleResetData}>
              Resetar dados
            </button>
          </div>
          <p className="top-actions-help">
            Ative os alertas para receber notificação, voz e som quando a fase mudar ou houver um
            sinal importante.
          </p>
        </div>
        <div className={`status-pill status-${phase.urgency}`}>{phase.label}</div>
      </header>

      <main className="content-grid">
        <CurrentContractionCard
          activeContraction={activeContraction}
          currentDuration={currentDuration}
          onStart={handleStartContraction}
          onEnd={handleEndContraction}
          onWellbeingChange={handleWellbeingChange}
          formatClockTime={formatClockTime}
          formatDuration={formatDuration}
        />
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <RecommendationCard
          phase={phase}
          recommendation={recommendationView}
          urgency={warningAssessment.level !== 'calm' ? warningAssessment.level : phase.urgency}
          wellbeingSummary={wellbeingSummary}
        />
        <WarningSignalsCard
          signals={warningSignals}
          onToggleSignal={handleToggleSignal}
          assessment={warningAssessment}
          open={warningSignalsOpen || warningAssessment.level === 'critical'}
          onToggleOpen={() => setWarningSignalsOpen((current) => !current)}
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
        <DoulaContactCard
          doulaPhone={doulaPhone}
          onChangePhone={setDoulaPhone}
          whatsAppUrl={whatsAppUrl}
        />
        <GuidanceCard />
      </main>

      <footer className="footer-note">
        Este app e apenas um apoio de monitoramento e nao substitui orientacao medica.
      </footer>

      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}

export default App
