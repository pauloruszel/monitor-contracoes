import React, { useEffect, useMemo, useRef, useState } from 'react'
import CurrentContractionCard from './components/CurrentContractionCard'
import MetricsCard from './components/MetricsCard'
import RecommendationCard from './components/RecommendationCardV2'
import TimelineChart from './components/TimelineChart'
import HistoryList from './components/HistoryList'
import DoulaContactCard from './components/DoulaContactCard'
import GuidanceCard from './components/GuidanceCard'
import ManualModal from './components/ManualModal'
import WarningSignalsCard from './components/WarningSignalsCard'
import SharingCard from './components/SharingCard'
import DoulaViewPage from './pages/DoulaViewPage'
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
import { isSupabaseConfigured } from './lib/supabase'
import {
  closeSharedSession,
  createSharedSession,
  syncContractions,
  syncWarningSignals,
} from './services/sharingService'
import {
  requestNotificationPermission,
  triggerBrowserNotification,
  triggerSoundAlert,
  triggerVoiceAlert,
} from './utils/alertUtils'

const ANALYSIS_WINDOW = 5
const initialStored = loadFromStorage()
const defaultWarningSignals = {
  mucusPlug: false,
  watersBroken: false,
  meconium: false,
  reducedMovement: false,
  bleeding: false,
  badSmellOrFever: false,
  preterm: false,
}

function getShareTokenFromHash() {
  const match = window.location.hash.match(/^#\/acompanhar\/([^/]+)$/)
  return match ? match[1] : ''
}

function buildShareUrl(shareToken) {
  return `${window.location.origin}${window.location.pathname}#/acompanhar/${shareToken}`
}

function MonitorPage() {
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
  const [sharedSession, setSharedSession] = useState(() =>
    initialStored.sharedSession
      ? {
          ...initialStored.sharedSession,
          shareUrl:
            initialStored.sharedSession.shareUrl ||
            buildShareUrl(initialStored.sharedSession.shareToken),
        }
      : null,
  )
  const [warningSignals, setWarningSignals] = useState(
    initialStored.warningSignals || defaultWarningSignals,
  )
  const [manualOpen, setManualOpen] = useState(false)
  const [warningSignalsOpen, setWarningSignalsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')
  const [now, setNow] = useState(Date.now())
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [installFeedback, setInstallFeedback] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    const onInstalled = () => {
      setInstallFeedback('App instalado na tela inicial.')
      setInstallPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    saveToStorage({
      contractions,
      activeContraction,
      doulaPhone,
      alertsEnabled,
      lastAlertKey,
      sharedSession,
      warningSignals,
    })
  }, [
    contractions,
    activeContraction,
    doulaPhone,
    alertsEnabled,
    lastAlertKey,
    sharedSession,
    warningSignals,
  ])

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

  const handleInstallApp = async () => {
    if (!installPromptEvent) return

    await installPromptEvent.prompt()
    const choice = await installPromptEvent.userChoice

    if (choice.outcome === 'accepted') {
      setInstallFeedback('Instalação iniciada. Confirme no sistema se necessário.')
    }

    setInstallPromptEvent(null)
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
    setSharedSession(null)
    setWarningSignals(defaultWarningSignals)
  }

  const handleToggleSignal = (key) => {
    setWarningSignals((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const handleStartSharing = async () => {
    try {
      const createdSession = await createSharedSession({ doulaPhone })
      setSharedSession({
        ...createdSession,
        shareUrl: buildShareUrl(createdSession.shareToken),
      })
      setSyncStatus('Sessão criada. Sincronizando marcações...')
    } catch {
      setSyncStatus('Não foi possível iniciar o compartilhamento agora.')
    }
  }

  const handleCopyLink = async () => {
    if (!sharedSession?.shareUrl) return
    try {
      await navigator.clipboard.writeText(sharedSession.shareUrl)
      setSyncStatus('Link da doula copiado.')
    } catch {
      setSyncStatus('Não foi possível copiar o link automaticamente.')
    }
  }

  const handleEndSharing = async () => {
    if (!sharedSession) return
    try {
      await closeSharedSession(sharedSession)
      setSharedSession(null)
      setSyncStatus('Compartilhamento encerrado.')
    } catch {
      setSyncStatus('Não foi possível encerrar o compartilhamento agora.')
    }
  }

  useEffect(() => {
    if (!sharedSession || !isSupabaseConfigured) return

    async function runSync() {
      try {
        await syncContractions(sharedSession, contractions)
        setSyncStatus((current) =>
          current && current.includes('Link da doula copiado')
            ? current
            : 'Contrações sincronizadas com a doula.',
        )
      } catch {
        setSyncStatus('Falha ao sincronizar contrações.')
      }
    }

    runSync()
  }, [sharedSession, contractions])

  useEffect(() => {
    if (!sharedSession || !isSupabaseConfigured) return

    async function runSync() {
      try {
        await syncWarningSignals(sharedSession, warningSignals)
        setSyncStatus((current) =>
          current && current.includes('Falha') ? current : 'Sinais de alerta sincronizados.',
        )
      } catch {
        setSyncStatus('Falha ao sincronizar sinais de alerta.')
      }
    }

    runSync()
  }, [sharedSession, warningSignals])

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
            {installPromptEvent ? (
              <button className="button button-install" onClick={handleInstallApp}>
                Instalar app
              </button>
            ) : null}
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
          {installFeedback ? <p className="top-actions-help">{installFeedback}</p> : null}
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
        <SharingCard
          configured={isSupabaseConfigured}
          sharedSession={sharedSession}
          syncStatus={syncStatus}
          onStartSharing={handleStartSharing}
          onCopyLink={handleCopyLink}
          onEndSharing={handleEndSharing}
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
        Este app é apenas um apoio de monitoramento e não substitui orientação médica.
      </footer>

      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}

function App() {
  const [shareToken, setShareToken] = useState(() => getShareTokenFromHash())

  useEffect(() => {
    const onHashChange = () => setShareToken(getShareTokenFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (shareToken) {
    return <DoulaViewPage shareToken={shareToken} />
  }

  return <MonitorPage />
}

export default App
