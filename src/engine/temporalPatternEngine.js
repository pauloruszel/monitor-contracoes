import { CLINICAL_PATTERN_COPY } from '../content/clinicalCopy'

export const TEMPORAL_PATTERNS = {
  prodomos: {
    key: 'prodomos',
    label: CLINICAL_PATTERN_COPY.prodomos.label,
    urgency: 'calm',
    alertKey: '',
  },
  latente: {
    key: 'latente',
    label: CLINICAL_PATTERN_COPY.latente.label,
    urgency: 'attention',
    alertKey: 'call-doula',
  },
  ativa: {
    key: 'ativa',
    label: CLINICAL_PATTERN_COPY.ativa.label,
    urgency: 'warning',
    alertKey: 'prepare-hospital',
  },
  transicao: {
    key: 'transicao',
    label: CLINICAL_PATTERN_COPY.transicao.label,
    urgency: 'critical',
    alertKey: 'hospital-now',
  },
}

export function getIrregularity(intervals) {
  if (intervals.length < 3) return false
  const max = Math.max(...intervals)
  const min = Math.min(...intervals)
  return max - min > 180
}

export function evaluateTemporalPattern({ contractions, intervals, averageDuration, averageInterval }) {
  if (contractions.length < 2 || !averageInterval) {
    return {
      ...TEMPORAL_PATTERNS.prodomos,
      patternLabel: 'Poucos dados',
      description: CLINICAL_PATTERN_COPY.prodomos.descriptions.lowData,
    }
  }

  const irregular = getIrregularity(intervals)
  const avgMinutes = averageInterval / 60

  if (avgMinutes < 3) {
    return {
      ...TEMPORAL_PATTERNS.transicao,
      patternLabel: irregular ? 'Padrao intenso' : 'Padrao muito frequente',
      description: irregular
        ? CLINICAL_PATTERN_COPY.transicao.descriptions.irregular
        : CLINICAL_PATTERN_COPY.transicao.descriptions.regular,
    }
  }

  if (avgMinutes <= 4 && averageDuration >= 45) {
    return {
      ...TEMPORAL_PATTERNS.ativa,
      patternLabel: irregular ? 'Padrao encurtando' : 'Padrao consistente',
      description: irregular
        ? CLINICAL_PATTERN_COPY.ativa.descriptions.irregular
        : CLINICAL_PATTERN_COPY.ativa.descriptions.regular,
    }
  }

  if (avgMinutes <= 7) {
    return {
      ...TEMPORAL_PATTERNS.latente,
      patternLabel: irregular ? 'Padrao ainda irregular' : 'Padrao em faixa latente',
      description: irregular
        ? CLINICAL_PATTERN_COPY.latente.descriptions.irregular
        : CLINICAL_PATTERN_COPY.latente.descriptions.regular,
    }
  }

  return {
    ...TEMPORAL_PATTERNS.prodomos,
    patternLabel: irregular ? 'Padrao ainda irregular' : 'Padrao espacado',
    description: irregular
      ? CLINICAL_PATTERN_COPY.prodomos.descriptions.irregular
      : CLINICAL_PATTERN_COPY.prodomos.descriptions.regular,
  }
}
