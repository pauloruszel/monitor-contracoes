const STORAGE_KEY = 'monitor-contracoes:v1'

export const defaultWarningSignals = {
  mucusPlug: false,
  watersBroken: false,
  meconium: false,
  reducedMovement: false,
  bleeding: false,
  badSmellOrFever: false,
  preterm: false,
}

export const defaultUserProfile = {
  firstPregnancy: true,
  gestationalWeeks: '',
  priorFastLabor: false,
}

export const defaultClinicalPreferences = {
  useFiveOneOne: true,
  alertSensitivity: 'standard',
  notifyDoulaEarly: false,
}

export const defaultSessionContext = {
  homeObservationGuidance: false,
  longTravelToHospital: false,
  bagReady: false,
  notes: '',
}

function getDefaultStorageState() {
  return {
    contractions: [],
    activeContraction: null,
    doulaPhone: '5521981688856',
    alertsEnabled: false,
    lastAlertKey: '',
    sharedSession: null,
    warningSignals: defaultWarningSignals,
    sessionContext: defaultSessionContext,
    userProfile: defaultUserProfile,
    clinicalPreferences: defaultClinicalPreferences,
  }
}

export function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return getDefaultStorageState()
  }

  try {
    const parsed = JSON.parse(raw)

    return {
      ...getDefaultStorageState(),
      ...parsed,
      warningSignals: {
        ...defaultWarningSignals,
        ...(parsed.warningSignals || {}),
      },
      sessionContext: {
        ...defaultSessionContext,
        notes: parsed.sessionContext?.notes ?? parsed.sessionNotes ?? defaultSessionContext.notes,
        ...(parsed.sessionContext || {}),
      },
      userProfile: {
        ...defaultUserProfile,
        ...(parsed.userProfile || {}),
      },
      clinicalPreferences: {
        ...defaultClinicalPreferences,
        ...(parsed.clinicalPreferences || {}),
      },
    }
  } catch {
    return getDefaultStorageState()
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}
