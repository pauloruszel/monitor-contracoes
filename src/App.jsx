import React, { useEffect, useMemo, useRef, useState } from 'react'
import DecisionCard from './components/DecisionCard'
import CollapsibleSection from './components/CollapsibleSection'
import CurrentContractionCard from './components/CurrentContractionCard'
import MetricsCard from './components/MetricsCard'
import TimelineChart from './components/TimelineChart'
import HistoryList from './components/HistoryList'
import SessionContextFormCard from './components/SessionContextFormCard'
import DoulaContactCard from './components/DoulaContactCard'
import UserProfileCardV2 from './components/UserProfileCardV2'
import GuidanceCard from './components/GuidanceCard'
import ManualModal from './components/ManualModal'
import WarningSignalsCard from './components/WarningSignalsCard'
import SharingCard from './components/SharingCard'
import ClinicalPreferencesCardV2 from './components/ClinicalPreferencesCardV2'
import SessionContextSummaryCard from './components/SessionContextSummaryCard'
import DoulaViewPage from './pages/DoulaViewPage'
import {
  buildTrendSummary,
  endContraction,
  formatClockTime,
  formatDuration,
  getAverageDuration,
  getAverageDurationFromList,
  getAverageInterval,
  getAverageIntervalFromList,
  getContractionsInLastMinutes,
  getCurrentContractionDuration,
  getIntervals,
  getLastItems,
  getWellbeingSummary,
  normalizeContractions,
  startContraction,
} from './utils/contractionUtils'
import { getPhaseFromMetrics, getRecommendationFromPhase } from './utils/phaseRules'
import {
  clearStorage,
  defaultClinicalPreferences,
  defaultSessionContext,
  defaultUserProfile,
  defaultWarningSignals,
  loadFromStorage,
  saveToStorage,
} from './utils/storage'
import { getWarningSignalAssessment } from './utils/warningSignals'
import { isFirebaseConfigured } from './lib/firebase'
import {
  closeSharedSession,
  createSharedSession,
  getSessionByWriterToken,
  resetSharedSessionData,
  syncContractions,
  syncSessionContext,
  syncWarningSignals,
} from './services/firebaseSharingService'
import {
  requestNotificationPermission,
  triggerBrowserNotification,
  triggerSoundAlert,
  triggerVoiceAlert,
} from './utils/alertUtils'
import { formatAdjustmentCopy } from './utils/sessionContextUtils'

const ANALYSIS_WINDOW = 5
const initialStored = loadFromStorage()
function getShareTokenFromHash() {
  const match = window.location.hash.match(/^#\/acompanhar\/([^/]+)$/)
  return match ? match[1] : ''
}

function buildShareUrl(shareToken) {
  return `${window.location.origin}${window.location.pathname}#/acompanhar/${shareToken}`
}

const warningSignalLabels = {
  mucusPlug: 'Perda do tampão',
  watersBroken: 'Bolsa rompeu',
  meconium: 'Líquido verde ou marrom',
  reducedMovement: 'Menos movimentos do bebê',
  bleeding: 'Sangramento',
  badSmellOrFever: 'Cheiro ruim ou febre',
  preterm: 'Menos de 37 semanas',
}

function formatWhatsAppTimestamp(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function getWhatsAppActionLabel(actionTitle) {
  const labels = {
    'Continuar em casa': 'Continuar em casa',
    'Avisar a doula': 'Avisar a doula',
    'Avisar a doula cedo': 'Avisar a doula cedo',
    'Preparar ida': 'Preparar ida ao hospital',
    'Ir ao hospital': 'Ir ao hospital agora',
    'Ir ao hospital / procurar atendimento': 'Ir ao hospital / procurar atendimento',
    'Entrar em contato com a maternidade': 'Entrar em contato com a maternidade',
    'Avisar a equipe': 'Avisar a equipe',
    Observar: 'Observar com atenção',
  }

  return labels[actionTitle] || actionTitle
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
  const [sessionContext, setSessionContext] = useState(
    initialStored.sessionContext || defaultSessionContext,
  )
  const [userProfile, setUserProfile] = useState(initialStored.userProfile || defaultUserProfile)
  const [clinicalPreferences, setClinicalPreferences] = useState(
    initialStored.clinicalPreferences || defaultClinicalPreferences,
  )
  const [manualOpen, setManualOpen] = useState(false)
  const [warningSignalsOpen, setWarningSignalsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [sessionContextOpen, setSessionContextOpen] = useState(false)
  const [sharingToolsOpen, setSharingToolsOpen] = useState(false)
  const [guidanceOpen, setGuidanceOpen] = useState(false)
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
      sessionContext,
      userProfile,
      clinicalPreferences,
    })
  }, [
    contractions,
    activeContraction,
    doulaPhone,
    alertsEnabled,
    lastAlertKey,
    sharedSession,
    warningSignals,
    sessionContext,
    userProfile,
    clinicalPreferences,
  ])

  useEffect(() => {
    if (!sharedSession || !isFirebaseConfigured) return

    let cancelled = false

    async function validateSharedSession() {
      try {
        await getSessionByWriterToken(sharedSession.sessionId, sharedSession.writerToken)
      } catch {
        if (cancelled) return
        setSharedSession(null)
        setSyncStatus(
          'A sessão compartilhada salva neste aparelho não existe mais no banco. Inicie um novo compartilhamento.',
        )
      }
    }

    validateSharedSession()

    return () => {
      cancelled = true
    }
  }, [sharedSession])

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
  const temporalMetrics = useMemo(
    () => ({
      metrics1h,
      metrics2h,
    }),
    [metrics1h, metrics2h],
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
        userProfile,
        clinicalPreferences,
      }),
    [
      recentContractions,
      intervals,
      averageDuration,
      averageInterval,
      trendSummary,
      userProfile,
      clinicalPreferences,
    ],
  )

  const recommendation = useMemo(
    () =>
      getRecommendationFromPhase(phase.key, {
        trendSummary,
        userProfile,
        clinicalPreferences,
      }),
    [phase.key, trendSummary, userProfile, clinicalPreferences],
  )
  const wellbeingSummary = useMemo(() => getWellbeingSummary(recentContractions), [recentContractions])
  const warningAssessment = useMemo(
    () => getWarningSignalAssessment(warningSignals),
    [warningSignals],
  )
  const hasActiveWarningSignals = useMemo(
    () => Object.values(warningSignals).some(Boolean),
    [warningSignals],
  )
  void temporalMetrics
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

  const handleResetData = async () => {
    const confirmed = window.confirm(
      sharedSession
        ? 'Tem certeza que deseja resetar todos os dados salvos? Essa ação apaga o histórico, a contração em andamento, os alertas e também remove a sessão compartilhada no banco.'
        : 'Tem certeza que deseja resetar todos os dados salvos? Essa ação apaga o histórico, a contração em andamento e os alertas.',
    )

    if (!confirmed) return

    if (sharedSession && isFirebaseConfigured) {
      try {
        await resetSharedSessionData(sharedSession)
      } catch {
        window.alert(
          'Não foi possível apagar os dados compartilhados no banco agora. Seus dados locais foram mantidos para evitar inconsistência. Tente novamente com internet ativa.',
        )
        return
      }
    }

    clearStorage()
    setContractions([])
    setActiveContraction(null)
    setDoulaPhone('5521981688856')
    setAlertsEnabled(false)
    setLastAlertKey('')
    setSharedSession(null)
    setWarningSignals(defaultWarningSignals)
    setSessionContext(defaultSessionContext)
    setUserProfile(defaultUserProfile)
    setClinicalPreferences(defaultClinicalPreferences)
    setSyncStatus(sharedSession ? 'Dados locais e compartilhados apagados.' : '')
  }

  const handleToggleSignal = (key) => {
    setWarningSignals((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const handleProfileChange = (key, value) => {
    setUserProfile((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handlePreferenceChange = (key, value) => {
    setClinicalPreferences((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSessionContextChange = (key, value) => {
    setSessionContext((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleStartSharing = async () => {
    try {
      const createdSession = await createSharedSession({ doulaPhone })
      const nextSharedSession = {
        ...createdSession,
        shareUrl: buildShareUrl(createdSession.shareToken),
      }

      try {
        await syncSessionContext(nextSharedSession, {
          sessionContext,
          userProfile,
          clinicalPreferences,
        })
        await syncWarningSignals(nextSharedSession, warningSignals)
        await syncContractions(nextSharedSession, contractions)
      } catch {
        await resetSharedSessionData(nextSharedSession).catch(() => {})
        throw new Error('initial_sync_failed')
      }

      setSharedSession({
        ...nextSharedSession,
      })
      setSyncStatus('Sessão criada e sincronizada com a doula.')
    } catch {
      setSharedSession(null)
      setSyncStatus('Não foi possível iniciar o compartilhamento no banco agora.')
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
    if (!sharedSession || !isFirebaseConfigured) return

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
    if (!sharedSession || !isFirebaseConfigured) return

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

  useEffect(() => {
    if (!sharedSession || !isFirebaseConfigured) return

    async function runSync() {
      try {
        await syncSessionContext(sharedSession, {
          sessionContext,
          userProfile,
          clinicalPreferences,
        })
      } catch {
        setSyncStatus((current) =>
          current && current.includes('Falha') ? current : 'Falha ao sincronizar contexto da sessão.',
        )
      }
    }

    runSync()
  }, [sharedSession, sessionContext, userProfile, clinicalPreferences])

  const metrics = {
    totalContractions: contractions.length,
    averageDuration,
    averageInterval,
    lastDuration: contractions.length > 0 ? contractions[contractions.length - 1].durationSeconds : null,
    lastInterval: intervals.length > 0 ? intervals[intervals.length - 1] : null,
    trendSummary,
  }

  const recommendationView = useMemo(() => {
    if (warningAssessment.level === 'critical' || warningAssessment.level === 'warning') {
      return {
        title: warningAssessment.title,
        message: warningAssessment.message,
        secondary: 'O alerta vem antes da leitura do ritmo.',
        alertMessage: warningAssessment.message,
      }
    }

    if (wellbeingSummary.dominant === 'red') {
      return {
        ...recommendation,
        secondary: 'Muita dor recente. Vale falar com a doula ou equipe agora.',
      }
    }

    if (wellbeingSummary.dominant === 'yellow' && phase.key === 'prodomos') {
      return {
        ...recommendation,
        secondary: 'Ainda parece início, mas já pede observação mais próxima.',
      }
    }

    return recommendation
  }, [recommendation, wellbeingSummary, phase.key, warningAssessment])
  const phoneDigits = doulaPhone.replace(/\D/g, '')
  const hasValidDoulaPhone = phoneDigits.length >= 12
  const screenUrgency =
    warningAssessment.level === 'critical'
      ? 'critical'
      : warningAssessment.level === 'warning'
        ? 'warning'
        : phase.urgency
  const activeWarningLabels = useMemo(
    () =>
      Object.entries(warningSignals)
        .filter(([, enabled]) => enabled)
        .map(([key]) => warningSignalLabels[key] || key),
    [warningSignals],
  )
  const hasShareLink = Boolean(sharedSession?.shareUrl)
  const canSendWhatsAppSummary = hasValidDoulaPhone && recentContractions.length > 0
  const whatsAppMessage = useMemo(() => {
    if (!canSendWhatsAppSummary) return ''

    const lines = [
      'Monitor de Contrações',
      '',
      `Atualização: ${formatWhatsAppTimestamp(Date.now())}`,
      `Conduta: ${getWhatsAppActionLabel(recommendationView.title)}`,
      `Fase provável: ${phase.label}`,
      '',
      `Intervalo médio: ${formatDuration(averageInterval)}`,
      `Duração média: ${formatDuration(averageDuration)}`,
      `Tendência: ${trendSummary?.summaryLabel || 'ainda sem padrão claro'}`,
      `Contrações recentes: ${recentContractions.length}`,
      '',
      `Bem-estar: ${wellbeingSummary.label}`,
      `Alertas: ${
        activeWarningLabels.length > 0 ? activeWarningLabels.join(', ') : 'nenhum marcado'
      }`,
    ]

    if (hasShareLink) {
      lines.push('', 'Acompanhar ao vivo:', sharedSession.shareUrl)
    }

    return encodeURIComponent(lines.join('\n'))
  }, [
    activeWarningLabels,
    averageDuration,
    averageInterval,
    canSendWhatsAppSummary,
    formatDuration,
    hasShareLink,
    phase.label,
    recentContractions.length,
    recommendationView.title,
    sharedSession?.shareUrl,
    trendSummary,
    wellbeingSummary.label,
  ])
  const whatsAppUrl =
    hasValidDoulaPhone && whatsAppMessage ? `https://wa.me/${phoneDigits}?text=${whatsAppMessage}` : ''
  const whatsAppHint = !phoneDigits
    ? 'Informe o número com DDI para habilitar o envio.'
    : !hasValidDoulaPhone
      ? 'Revise o número com DDI. Ele precisa estar completo para habilitar o envio.'
    : !canSendWhatsAppSummary
      ? 'Registre ao menos 1 contração para enviar um resumo útil.'
      : hasShareLink
        ? 'O resumo incluirá a leitura atual e o link da sessão ao vivo.'
        : 'O resumo incluirá a leitura atual da sessão.'

  return (
    <div className={`app-shell app-shell-${screenUrgency}`}>
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
      </header>

      <main className="content-grid">
        <DecisionCard
          phase={phase}
          recommendation={recommendationView}
          warningAssessment={warningAssessment}
          urgency={screenUrgency}
          trendSummary={trendSummary}
          metrics={metrics}
          formatDuration={formatDuration}
          adjustmentCopy={formatAdjustmentCopy(phase.adjustmentReasons)}
        />
        <CurrentContractionCard
          activeContraction={activeContraction}
          currentDuration={currentDuration}
          onStart={handleStartContraction}
          onEnd={handleEndContraction}
          onWellbeingChange={handleWellbeingChange}
          formatClockTime={formatClockTime}
          formatDuration={formatDuration}
        />
        <WarningSignalsCard
          signals={warningSignals}
          onToggleSignal={handleToggleSignal}
          assessment={warningAssessment}
          open={
            warningSignalsOpen ||
            warningAssessment.level === 'critical' ||
            warningAssessment.level === 'warning' ||
            hasActiveWarningSignals
          }
          onToggleOpen={() => setWarningSignalsOpen((current) => !current)}
        />
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <CollapsibleSection
          title="Leitura temporal"
          description="Visualização detalhada da evolução recente e da sequência de registros."
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
        <CollapsibleSection
          title="Contexto da sessão"
          description="Observações, perfil e preferências que ajudam a interpretar melhor a evolução."
          badge="Fechado por padrão"
          open={sessionContextOpen}
          onToggle={() => setSessionContextOpen((current) => !current)}
          countLabel="contexto"
        >
          <SessionContextSummaryCard
            sessionContext={sessionContext}
            userProfile={userProfile}
            clinicalPreferences={clinicalPreferences}
            mode="monitor"
          />
          <SessionContextFormCard
            sessionContext={sessionContext}
            onChangeContext={handleSessionContextChange}
          />
          <UserProfileCardV2 userProfile={userProfile} onChangeProfile={handleProfileChange} />
          <ClinicalPreferencesCardV2
            clinicalPreferences={clinicalPreferences}
            onChangePreference={handlePreferenceChange}
          />
        </CollapsibleSection>
        <CollapsibleSection
          title="Compartilhamento e apoio"
          description="Ferramentas operacionais para compartilhar a sessão e acionar contato rápido."
          badge="Operacional"
          open={sharingToolsOpen}
          onToggle={() => setSharingToolsOpen((current) => !current)}
          countLabel="ferramentas"
        >
          <SharingCard
            configured={isFirebaseConfigured}
            sharedSession={sharedSession}
            syncStatus={syncStatus}
            onStartSharing={handleStartSharing}
            onCopyLink={handleCopyLink}
            onEndSharing={handleEndSharing}
          />
          <DoulaContactCard
            doulaPhone={doulaPhone}
            onChangePhone={setDoulaPhone}
            whatsAppUrl={whatsAppUrl}
            canSendSummary={canSendWhatsAppSummary}
            sendSummaryHint={whatsAppHint}
          />
        </CollapsibleSection>
        <CollapsibleSection
          title="Orientações práticas"
          description="Resumo rápido de condutas de apoio que não substitui avaliação profissional."
          badge="Apoio"
          open={guidanceOpen}
          onToggle={() => setGuidanceOpen((current) => !current)}
        >
          <GuidanceCard />
        </CollapsibleSection>
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

