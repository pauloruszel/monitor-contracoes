import { WARNING_SIGNAL_COPY } from '../content/clinicalCopy'

export function evaluateWarningSignals(signals) {
  const safeSignals = {
    mucusPlug: false,
    watersBroken: false,
    meconium: false,
    reducedMovement: false,
    bleeding: false,
    badSmellOrFever: false,
    preterm: false,
    ...signals,
  }

  if (
    safeSignals.meconium ||
    safeSignals.reducedMovement ||
    safeSignals.bleeding ||
    safeSignals.badSmellOrFever ||
    (safeSignals.watersBroken && safeSignals.preterm)
  ) {
    return {
      level: 'critical',
      title: WARNING_SIGNAL_COPY.critical.title,
      message: WARNING_SIGNAL_COPY.critical.message,
      alertKey: 'warning-signal-critical',
    }
  }

  if (safeSignals.watersBroken) {
    return {
      level: 'warning',
      title: WARNING_SIGNAL_COPY.watersBroken.title,
      message: WARNING_SIGNAL_COPY.watersBroken.message,
      alertKey: 'warning-signal-waters',
    }
  }

  if (safeSignals.mucusPlug && safeSignals.preterm) {
    return {
      level: 'warning',
      title: WARNING_SIGNAL_COPY.mucusPreterm.title,
      message: WARNING_SIGNAL_COPY.mucusPreterm.message,
      alertKey: 'warning-signal-mucus-preterm',
    }
  }

  if (safeSignals.mucusPlug) {
    return {
      level: 'attention',
      title: WARNING_SIGNAL_COPY.mucusPlug.title,
      message: WARNING_SIGNAL_COPY.mucusPlug.message,
      alertKey: '',
    }
  }

  return {
    level: 'calm',
    title: WARNING_SIGNAL_COPY.calm.title,
    message: WARNING_SIGNAL_COPY.calm.message,
    alertKey: '',
  }
}
