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
import {
  clearStorage,
  defaultClinicalPreferences,
  defaultSessionContext,
  defaultUserProfile,
  defaultWarningSignals,
  loadFromStorage,
  saveToStorage,
} from './utils/storage'
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
import { getSessionDecision } from './engine/decisionEngine'
import { mapDecisionToDecisionCardViewModel } from './adapters/decisionViewModel'

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
  mucusPlug: 'Perda do tamp\u00e3o',
  watersBroken: 'Bolsa rompeu',
  meconium: 'L\u00edquido verde ou marrom',
  reducedMovement: 'Menos movimentos do beb\u00ea',
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
    Observar: 'Observar com aten\u00e7\u00e3o',
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
          'A sess\u00e3o compartilhada salva neste aparelho n\u00e3o existe mais no banco. Inicie um novo compartilhamento.',
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
    () => ({ metrics1h, metrics2h }),
    [metrics1h, metrics2h],
  )
  const trendSummary = useMemo(
    () => buildTrendSummary({ metrics1h, metrics2h }),
    [metrics1h, metrics2h],
  )

  const wellbeingSummary = useMemo(() => getWellbeingSummary(recentContractions), [recentContractions])
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
        wellbeingSummary,
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
      wellbeingSummary,
    ],
  )
  const { pattern, warningSignal, actionPlan, decision: decisionMeta } = decision
  const screenUrgency = decisionMeta.urgency
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
    const nextAlertKey = warningSignal.alertKey || pattern.alertKey
    const nextAlertMessage =
      warningSignal.alertKey && warningSignal.level !== 'calm'
        ? warningSignal.message
        : actionPlan.alertMessage
    const nextUrgency =
      warningSignal.level === 'critical'
        ? 'critical'
        : warningSignal.level === 'warning'
          ? 'warning'
          : pattern.urgency

    if (!alertsEnabled || !nextAlertKey) return
    if (alertStateRef.current === nextAlertKey) return

    triggerBrowserNotification('Monitor de Contra\u00e7\u00f5es', nextAlertMessage)
    triggerVoiceAlert(nextAlertMessage)
    triggerSoundAlert(nextUrgency)
    setLastAlertKey(nextAlertKey)
  }, [
    alertsEnabled,
    warningSignal.alertKey,
    warningSignal.level,
    warningSignal.message,
    pattern.alertKey,
    pattern.urgency,
    actionPlan.alertMessage,
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
      setInstallFeedback('Instala\u00e7\u00e3o iniciada. Confirme no sistema se necess\u00e1rio.')
    }

    setInstallPromptEvent(null)
  }

  const handleResetData = async () => {
    const confirmed = window.confirm(
      sharedSession
        ? 'Tem certeza que deseja resetar todos os dados salvos? Essa a\u00e7\u00e3o apaga o hist\u00f3rico, a contra\u00e7\u00e3o em andamento, os alertas e tamb\u00e9m remove a sess\u00e3o compartilhada no banco.'
        : 'Tem certeza que deseja resetar todos os dados salvos? Essa a\u00e7\u00e3o apaga o hist\u00f3rico, a contra\u00e7\u00e3o em andamento e os alertas.',
    )

    if (!confirmed) return

    if (sharedSession && isFirebaseConfigured) {
      try {
        await resetSharedSessionData(sharedSession)
      } catch {
        window.alert(
          'N\u00e3o foi poss\u00edvel apagar os dados compartilhados no banco agora. Seus dados locais foram mantidos para evitar inconsist\u00eancia. Tente novamente com internet ativa.',
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

      setSharedSession({ ...nextSharedSession })
      setSyncStatus('Sess\u00e3o criada e sincronizada com a doula.')
    } catch {
      setSharedSession(null)
      setSyncStatus('N\u00e3o foi poss\u00edvel iniciar o compartilhamento no banco agora.')
    }
  }

  const handleCopyLink = async () => {
    if (!sharedSession?.shareUrl) return
    try {
      await navigator.clipboard.writeText(sharedSession.shareUrl)
      setSyncStatus('Link da doula copiado.')
    } catch {
      setSyncStatus('N\u00e3o foi poss\u00edvel copiar o link automaticamente.')
    }
  }

  const handleEndSharing = async () => {
    if (!sharedSession) return
    try {
      await closeSharedSession(sharedSession)
      setSharedSession(null)
      setSyncStatus('Compartilhamento encerrado.')
    } catch {
      setSyncStatus('N\u00e3o foi poss\u00edvel encerrar o compartilhamento agora.')
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
            : 'Contra\u00e7\u00f5es sincronizadas com a doula.',
        )
      } catch {
        setSyncStatus('Falha ao sincronizar contra\u00e7\u00f5es.')
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
          current && current.includes('Falha') ? current : 'Falha ao sincronizar contexto da sess\u00e3o.',
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

  const decisionViewModel = useMemo(
    () =>
      mapDecisionToDecisionCardViewModel({
        decision,
        metrics,
        trendSummary,
        formatDuration,
      }),
    [decision, metrics, trendSummary, formatDuration],
  )

  const phoneDigits = doulaPhone.replace(/\D/g, '')
  const hasValidDoulaPhone = phoneDigits.length >= 12
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
      'Monitor de Contra\u00e7\u00f5es',
      '',
      `Atualiza\u00e7\u00e3o: ${formatWhatsAppTimestamp(Date.now())}`,
      `Conduta: ${getWhatsAppActionLabel(actionPlan.action)}`,
      `Leitura do padr\u00e3o: ${pattern.label}`,
      '',
      `Intervalo m\u00e9dio: ${formatDuration(averageInterval)}`,
      `Dura\u00e7\u00e3o m\u00e9dia: ${formatDuration(averageDuration)}`,
      `Tend\u00eancia: ${trendSummary?.summaryLabel || 'ainda sem padr\u00e3o claro'}`,
      `Contra\u00e7\u00f5es recentes: ${recentContractions.length}`,
      '',
      `Bem-estar: ${wellbeingSummary.label}`,
      `Alertas: ${activeWarningLabels.length > 0 ? activeWarningLabels.join(', ') : 'nenhum marcado'}`,
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
    pattern.label,
    recentContractions.length,
    actionPlan.action,
    sharedSession?.shareUrl,
    trendSummary,
    wellbeingSummary.label,
  ])
  const whatsAppUrl =
    hasValidDoulaPhone && whatsAppMessage ? `https://wa.me/${phoneDigits}?text=${whatsAppMessage}` : ''
  const whatsAppHint = !phoneDigits
    ? 'Informe o n\u00famero com DDI para habilitar o envio.'
    : !hasValidDoulaPhone
      ? 'Revise o n\u00famero com DDI. Ele precisa estar completo para habilitar o envio.'
      : !canSendWhatsAppSummary
        ? 'Registre ao menos 1 contra\u00e7\u00e3o para enviar um resumo \u00fatil.'
        : hasShareLink
          ? 'O resumo incluir\u00e1 a leitura atual e o link da sess\u00e3o ao vivo.'
          : 'O resumo incluir\u00e1 a leitura atual da sess\u00e3o.'

  return (
    <div className={`app-shell app-shell-${screenUrgency}`}>
      <header className="hero">
        <div>
          <p className="eyebrow">{'Trabalho de parto'}</p>
          <h1>{'Monitor de Contra\u00e7\u00f5es'}</h1>
          <p className="hero-copy">
            {'Registre as contra\u00e7\u00f5es, acompanhe a evolu\u00e7\u00e3o e receba alertas pr\u00e1ticos sem perder o foco.'}
          </p>
          <div className="top-actions">
            <button className="button button-manual" onClick={() => setManualOpen(true)}>
              {'Como usar'}
            </button>
            {installPromptEvent ? (
              <button className="button button-install" onClick={handleInstallApp}>
                {'Instalar app'}
              </button>
            ) : null}
            <button className="button button-top-alert" onClick={handleToggleAlerts}>
              {alertsEnabled ? 'Alertas autom\u00e1ticos: ligados' : 'Alertas autom\u00e1ticos: desligados'}
            </button>
            <button className="button button-reset" onClick={handleResetData}>
              {'Resetar dados'}
            </button>
          </div>
          <p className="top-actions-help">
            {'Ative os alertas para receber notifica\u00e7\u00e3o, voz e som quando a leitura mudar ou houver um sinal importante.'}
          </p>
          {installFeedback ? <p className="top-actions-help">{installFeedback}</p> : null}
        </div>
      </header>

      <main className="content-grid">
        <DecisionCard viewModel={decisionViewModel} />
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
          assessment={warningSignal}
          open={
            warningSignalsOpen ||
            warningSignal.level === 'critical' ||
            warningSignal.level === 'warning' ||
            hasActiveWarningSignals
          }
          onToggleOpen={() => setWarningSignalsOpen((current) => !current)}
        />
        <MetricsCard metrics={metrics} formatDuration={formatDuration} />
        <CollapsibleSection
          title={'Leitura temporal'}
          description={'Visualiza\u00e7\u00e3o detalhada da evolu\u00e7\u00e3o recente e da sequ\u00eancia de registros.'}
          badge={'Contexto'}
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
          title={'Contexto da sessão'}
          description={'Observa\u00e7\u00f5es, perfil e prefer\u00eancias que ajudam a interpretar melhor a evolu\u00e7\u00e3o.'}
          badge={'Fechado por padr\u00e3o'}
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
          title={'Compartilhamento e apoio'}
          description={'Ferramentas operacionais para compartilhar a sess\u00e3o e acionar contato r\u00e1pido.'}
          badge={'Operacional'}
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
          title={'Orienta\u00e7\u00f5es pr\u00e1ticas'}
          description={'Resumo r\u00e1pido de condutas de apoio que n\u00e3o substitui avalia\u00e7\u00e3o profissional.'}
          badge={'Apoio'}
          open={guidanceOpen}
          onToggle={() => setGuidanceOpen((current) => !current)}
        >
          <GuidanceCard />
        </CollapsibleSection>
      </main>

      <footer className="footer-note">
        {'Este app e\u0301 apenas um apoio de monitoramento e n\u00e3o substitui orienta\u00e7\u00e3o m\u00e9dica.'}
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
