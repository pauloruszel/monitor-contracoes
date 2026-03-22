import { supabase } from '../lib/supabase'

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

async function touchSession(sessionId) {
  const { error } = await supabase
    .from('sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw error
}

export async function createSharedSession({ doulaPhone }) {
  const share_token = generateToken()
  const writer_token = generateToken()

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      share_token,
      writer_token,
      doula_phone: doulaPhone || null,
    })
    .select()
    .single()

  if (error) throw error

  const warningSignalsResult = await supabase.from('warning_signals').insert({
    session_id: data.id,
  })

  if (warningSignalsResult.error) throw warningSignalsResult.error

  return {
    sessionId: data.id,
    shareToken: data.share_token,
    writerToken: data.writer_token,
    status: data.status,
  }
}

export async function closeSharedSession(sharedSession) {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', sharedSession.sessionId)
    .eq('writer_token', sharedSession.writerToken)

  if (error) throw error
}

export async function resetSharedSessionData(sharedSession) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sharedSession.sessionId)
    .eq('writer_token', sharedSession.writerToken)
    .single()

  if (sessionError || !session) throw sessionError || new Error('shared_session_not_found')

  const { error: contractionsError } = await supabase
    .from('contractions')
    .delete()
    .eq('session_id', sharedSession.sessionId)

  if (contractionsError) throw contractionsError

  const { error: warningSignalsError } = await supabase
    .from('warning_signals')
    .delete()
    .eq('session_id', sharedSession.sessionId)

  if (warningSignalsError) throw warningSignalsError

  const { error: deleteSessionError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sharedSession.sessionId)
    .eq('writer_token', sharedSession.writerToken)

  if (deleteSessionError) throw deleteSessionError
}

export async function syncContractions(sharedSession, contractions) {
  if (!contractions.length) return

  const payload = contractions.map((contraction) => ({
    id: contraction.id,
    session_id: sharedSession.sessionId,
    start_at: contraction.start.toISOString(),
    end_at: contraction.end.toISOString(),
    duration_seconds: contraction.durationSeconds,
    wellbeing: contraction.wellbeing || 'green',
  }))

  const { error } = await supabase.from('contractions').upsert(payload)
  if (error) throw error
  await touchSession(sharedSession.sessionId)
}

export async function syncWarningSignals(sharedSession, warningSignals) {
  const { error } = await supabase.from('warning_signals').upsert({
    session_id: sharedSession.sessionId,
    mucus_plug: warningSignals.mucusPlug,
    waters_broken: warningSignals.watersBroken,
    meconium: warningSignals.meconium,
    reduced_movement: warningSignals.reducedMovement,
    bleeding: warningSignals.bleeding,
    bad_smell_or_fever: warningSignals.badSmellOrFever,
    preterm: warningSignals.preterm,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
  await touchSession(sharedSession.sessionId)
}

export async function getSessionByShareToken(shareToken) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('share_token', shareToken)
    .single()

  if (error) throw error
  return data
}

export async function getContractionsBySession(sessionId) {
  const { data, error } = await supabase
    .from('contractions')
    .select('*')
    .eq('session_id', sessionId)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getWarningSignalsBySession(sessionId) {
  const { data, error } = await supabase
    .from('warning_signals')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) throw error
  return data
}

export function subscribeToSession(sessionId, onChange) {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'contractions', filter: `session_id=eq.${sessionId}` },
      (payload) => onChange({ source: 'contractions', payload }),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'warning_signals',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onChange({ source: 'warning_signals', payload }),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
      (payload) => onChange({ source: 'sessions', payload }),
    )
    .subscribe((status) => {
      onChange({ source: 'subscription_status', status })
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
