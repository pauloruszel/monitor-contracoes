import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('decisionEngine coverage branches', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unmock('./decisionEngine')
    vi.unmock('../content/decisionCopy')
    vi.unmock('./decisionInput')
    vi.unmock('./warningSignalEngine')
    vi.unmock('./carePlanEngine')
    vi.unmock('./obstetricContextEngine')
    vi.unmock('./temporalPatternEngine')
  })

  it('explicita que a matriz vazia hoje quebra ao tentar usar o fallback de precedencia', async () => {
    vi.doMock('../content/decisionCopy', () => ({
      DECISION_ENGINE_VERSION: 'test-version',
      DECISION_PRECEDENCE: [],
      DECISION_COPY: {
        precedence: {
          warningSignal: { interpretation: 'warning' },
          wellbeing: {
            severe: { interpretation: 'severe' },
            attention: { interpretation: 'attention' },
          },
        },
      },
    }))
    vi.doMock('./decisionInput', () => ({
      buildDecisionInput: (rawInput) => rawInput,
    }))
    vi.doMock('./warningSignalEngine', () => ({
      evaluateWarningSignals: () => ({ level: 'calm', title: '', message: '' }),
    }))
    vi.doMock('./carePlanEngine', () => ({
      buildCarePlan: () => ({ action: 'Continuar em casa', observation: '', interpretation: '' }),
    }))
    vi.doMock('./obstetricContextEngine', () => ({
      applyObstetricContext: () => ({ key: 'prodomos', urgency: 'calm' }),
    }))
    vi.doMock('./temporalPatternEngine', () => ({
      evaluateTemporalPattern: () => ({ key: 'prodomos', urgency: 'calm' }),
    }))

    const { getSessionDecision } = await import('./decisionEngine')
    expect(() =>
      getSessionDecision({
        temporalInput: {},
        warningSignals: {},
        sessionContext: {},
        userProfile: {},
        clinicalPreferences: {},
        wellbeingSummary: {},
      }),
    ).toThrow("Cannot read properties of undefined (reading 'key')")
  })

  it('preenche listas de ajustes com vazio quando o contexto nao retorna motivos', async () => {
    vi.doMock('../content/decisionCopy', async () => {
      const actual = await vi.importActual('../content/decisionCopy')
      return actual
    })
    vi.doMock('./decisionInput', () => ({
      buildDecisionInput: (rawInput) => rawInput,
    }))
    vi.doMock('./warningSignalEngine', () => ({
      evaluateWarningSignals: () => ({ level: 'calm', title: '', message: '' }),
    }))
    vi.doMock('./carePlanEngine', () => ({
      buildCarePlan: () => ({ action: 'Continuar em casa', observation: '', interpretation: '' }),
    }))
    vi.doMock('./obstetricContextEngine', () => ({
      applyObstetricContext: () => ({ key: 'prodomos', urgency: 'calm' }),
    }))
    vi.doMock('./temporalPatternEngine', () => ({
      evaluateTemporalPattern: () => ({ key: 'prodomos', urgency: 'calm' }),
    }))

    const { getSessionDecision } = await import('./decisionEngine')
    const result = getSessionDecision({
      temporalInput: {},
      warningSignals: {},
      sessionContext: {},
      userProfile: {},
      clinicalPreferences: {},
      wellbeingSummary: {},
    })

    expect(result.readingAdjustmentReasons).toEqual([])
    expect(result.actionAdjustmentReasons).toEqual([])
  })
})
