const STORAGE_KEY = 'monitor-contracoes:v1'

export function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {
      contractions: [],
      activeContraction: null,
      doulaPhone: '5521981688856',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: {
        mucusPlug: false,
        watersBroken: false,
        meconium: false,
        reducedMovement: false,
        bleeding: false,
        badSmellOrFever: false,
        preterm: false,
      },
    }
  }

  try {
    return JSON.parse(raw)
  } catch {
    return {
      contractions: [],
      activeContraction: null,
      doulaPhone: '5521981688856',
      alertsEnabled: false,
      lastAlertKey: '',
      sharedSession: null,
      warningSignals: {
        mucusPlug: false,
        watersBroken: false,
        meconium: false,
        reducedMovement: false,
        bleeding: false,
        badSmellOrFever: false,
        preterm: false,
      },
    }
  }
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}
