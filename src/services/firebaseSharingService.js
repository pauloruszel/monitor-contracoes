import { db } from '../lib/firebase'
import { get, off, onValue, push, ref, remove, set, update } from 'firebase/database'
import {
  defaultClinicalPreferences,
  defaultSessionContext,
  defaultUserProfile,
} from '../utils/storage'

const defaultWarningSignals = {
  mucusPlug: false,
  watersBroken: false,
  meconium: false,
  reducedMovement: false,
  bleeding: false,
  badSmellOrFever: false,
  preterm: false,
}

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

function toContractionPayload(contraction) {
  return {
    id: contraction.id,
    start:
      contraction.start instanceof Date ? contraction.start.toISOString() : new Date(contraction.start).toISOString(),
    end: contraction.end instanceof Date ? contraction.end.toISOString() : new Date(contraction.end).toISOString(),
    durationSeconds: contraction.durationSeconds,
    wellbeing: contraction.wellbeing || 'green',
  }
}

export async function createSharedSession({ doulaPhone }) {
  const sessionId = push(ref(db, 'sessions')).key
  const shareToken = generateToken()
  const writerToken = generateToken()
  const now = Date.now()

  const session = {
    id: sessionId,
    shareToken,
    writerToken,
    doulaPhone: doulaPhone || null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    contractions: {},
    warningSignals: defaultWarningSignals,
    sessionContext: defaultSessionContext,
    userProfile: defaultUserProfile,
    clinicalPreferences: defaultClinicalPreferences,
  }

  await set(ref(db, `sessions/${sessionId}`), session)

  return {
    sessionId,
    shareToken,
    writerToken,
    status: session.status,
  }
}

export async function closeSharedSession(sharedSession) {
  await update(ref(db, `sessions/${sharedSession.sessionId}`), {
    status: 'closed',
    updatedAt: Date.now(),
  })
}

export async function resetSharedSessionData(sharedSession) {
  await remove(ref(db, `sessions/${sharedSession.sessionId}`))
}

export async function syncContractions(sharedSession, contractions) {
  const sessionRef = ref(db, `sessions/${sharedSession.sessionId}`)
  const contractionsRef = ref(db, `sessions/${sharedSession.sessionId}/contractions`)
  const payload = {}

  contractions.forEach((contraction) => {
    payload[contraction.id] = toContractionPayload(contraction)
  })

  await set(contractionsRef, payload)
  await update(sessionRef, { updatedAt: Date.now() })
}

export async function syncWarningSignals(sharedSession, warningSignals) {
  await set(ref(db, `sessions/${sharedSession.sessionId}/warningSignals`), {
    ...defaultWarningSignals,
    ...warningSignals,
  })

  await update(ref(db, `sessions/${sharedSession.sessionId}`), {
    updatedAt: Date.now(),
  })
}

export async function syncSessionContext(sharedSession, contextBundle) {
  await update(ref(db, `sessions/${sharedSession.sessionId}`), {
    sessionContext: {
      ...defaultSessionContext,
      ...(contextBundle.sessionContext || {}),
    },
    userProfile: {
      ...defaultUserProfile,
      ...(contextBundle.userProfile || {}),
    },
    clinicalPreferences: {
      ...defaultClinicalPreferences,
      ...(contextBundle.clinicalPreferences || {}),
    },
    updatedAt: Date.now(),
  })
}

export async function getSessionByShareToken(shareToken) {
  const snapshot = await get(ref(db, 'sessions'))

  if (!snapshot.exists()) {
    throw new Error('session_not_found')
  }

  const sessions = snapshot.val()
  const found = Object.values(sessions).find((session) => session.shareToken === shareToken)

  if (!found) {
    throw new Error('session_not_found')
  }

  return found
}

export async function getSessionByWriterToken(sessionId, writerToken) {
  const snapshot = await get(ref(db, `sessions/${sessionId}`))

  if (!snapshot.exists()) {
    throw new Error('session_not_found')
  }

  const session = snapshot.val()

  if (session.writerToken !== writerToken) {
    throw new Error('invalid_writer_token')
  }

  return session
}

export async function getContractionsBySession(sessionId) {
  const snapshot = await get(ref(db, `sessions/${sessionId}/contractions`))

  if (!snapshot.exists()) {
    return []
  }

  return Object.values(snapshot.val()).sort((a, b) => new Date(a.start) - new Date(b.start))
}

export async function getWarningSignalsBySession(sessionId) {
  const snapshot = await get(ref(db, `sessions/${sessionId}/warningSignals`))

  if (!snapshot.exists()) {
    return { ...defaultWarningSignals }
  }

  return {
    ...defaultWarningSignals,
    ...snapshot.val(),
  }
}

export function subscribeToSession(sessionId, onChange) {
  const sessionRef = ref(db, `sessions/${sessionId}`)

  const listener = (snapshot) => {
    onChange({
      source: 'session',
      payload: snapshot.val(),
    })
  }

  onValue(sessionRef, listener)

  return () => off(sessionRef, 'value', listener)
}
