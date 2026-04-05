# Plano técnico de implementação por fases

## Objetivo
Implementar de forma incremental as melhorias clínicas e de produto do app, minimizando risco de regressão e aproveitando a arquitetura atual (`App.jsx`, `contractionUtils.js`, `phaseRules.js`, `TimelineChart.jsx`, storage local e Supabase).

---

# Fase 1 — observações e base de sessão

## Objetivo
Adicionar dados simples de sessão sem mexer ainda no motor principal de regras.

## Escopo
- adicionar observações por sessão
- adicionar estrutura de perfil/contexto básico da usuária
- persistir localmente
- preparar payload para compartilhamento futuro

## Mudanças técnicas
### 1. Estado principal (`src/App.jsx`)
Adicionar novos estados:
- `sessionNotes`
- `userProfile`
- `clinicalPreferences`

Exemplo de estrutura:
```js
const defaultUserProfile = {
  firstPregnancy: true,
  gestationalWeeks: null,
  priorFastLabor: false,
}

const defaultClinicalPreferences = {
  useFiveOneOne: true,
  alertSensitivity: 'standard',
  notifyDoulaEarly: false,
}
```

### 2. Persistência (`src/utils/storage.js`)
Salvar e carregar:
- observações
- perfil
- preferências

### 3. UI
Criar componentes leves:
- `SessionNotesCard`
- `UserProfileCard`
- `ClinicalPreferencesCard`

## Critérios de aceite
- usuário consegue registrar observações
- perfil básico fica salvo localmente
- preferências ficam salvas localmente
- não quebra timer, histórico, alertas nem compartilhamento atual

---

# Fase 2 — janela temporal real

## Objetivo
Trocar análise por quantidade fixa (`ANALYSIS_WINDOW = 5`) por análise baseada em tempo.

## Escopo
- últimas 1h
- últimas 2h
- manter compatibilidade com métricas atuais

## Mudanças técnicas
### 1. `src/utils/contractionUtils.js`
Criar funções novas:
```js
getContractionsInLastMinutes(contractions, minutes)
getAverageDurationFromList(contractions)
getAverageIntervalFromList(contractions)
getIntervalTrend(currentWindow, previousWindow)
```

### 2. `src/App.jsx`
Substituir/complementar:
- `recentContractions`
- `intervals`
- `averageDuration`
- `averageInterval`

Sugestão:
- `metrics1h`
- `metrics2h`
- `trendSummary`

## Critérios de aceite
- o app calcula métricas das últimas 1h e 2h
- a análise deixa de depender exclusivamente dos últimos 5 eventos
- o histórico antigo continua funcionando

---

# Fase 3 — tendência temporal

## Objetivo
Detectar progressão do padrão.

## Escopo
- intervalo encurtando / estável / espaçando
- duração aumentando / estável / reduzindo
- regularidade do padrão

## Mudanças técnicas
### 1. `src/utils/contractionUtils.js`
Criar funções como:
```js
getTrendLabel(values)
getPatternRegularity(intervals)
buildTrendSummary({ metrics1h, metrics2h })
```

### 2. UI
Adicionar exibição em:
- `MetricsCard`
- `RecommendationCard`
- opcionalmente `TimelineChart`

## Critérios de aceite
- app mostra se padrão está progredindo ou não
- recomendação contextual usa tendência temporal

---

# Fase 4 — motor de regras explícito

## Objetivo
Refatorar `phaseRules.js` para um formato extensível.

## Escopo
- separar regras de fase
- separar regras de alerta
- separar regras de override por contexto

## Mudanças técnicas
### 1. `src/utils/phaseRules.js`
Migrar de lógica fixa para regras mais modulares.

Exemplo de direção:
```js
const baseRules = []
const alertRules = []
const profileAdjustments = []
```

Criar funções como:
```js
evaluatePhaseRules(input)
evaluateAlertRules(input)
evaluateProfileAdjustments(input)
buildRecommendation(input)
```

## Critérios de aceite
- regras ficam testáveis isoladamente
- fases continuam funcionando
- sinais de alerta continuam tendo prioridade

---

# Fase 5 — regra 5-1-1

## Objetivo
Adicionar critério explícito 5-1-1 como sinal interpretável pelo app.

## Escopo
- identificar padrão 5-1-1
- usar isso em recomendações e alertas

## Mudanças técnicas
### 1. `src/utils/phaseRules.js`
Criar função:
```js
matchesFiveOneOne(contractions1h)
```

### 2. UI
Exibir status do critério:
- atingido
- próximo
- não atingido

## Critérios de aceite
- o app reconhece 5-1-1 de forma explícita
- a recomendação passa a explicar quando esse critério influenciou a decisão

---

# Fase 6 — perfil por usuária

## Objetivo
Ajustar interpretações com base no contexto obstétrico.

## Escopo
- primeira gestação / já teve partos
- idade gestacional
- parto anterior rápido

## Mudanças técnicas
### 1. `src/utils/phaseRules.js`
Receber `userProfile` como entrada do motor de decisão.

### 2. `src/App.jsx`
Propagar perfil para construção de recomendação.

## Critérios de aceite
- perfil influencia recomendação sem quebrar lógica atual
- comportamento continua transparente e explicável

---

# Fase 7 — regras configuráveis

## Objetivo
Permitir adaptar o app à orientação profissional.

## Escopo
- ativar/desativar 5-1-1
- sensibilidade de alertas
- avisar doula mais cedo
- thresholds customizados

## Mudanças técnicas
### 1. `ClinicalPreferencesCard`
Criar UI de configuração.

### 2. `phaseRules.js`
Ler preferências ao montar a recomendação final.

## Critérios de aceite
- preferências persistem
- regras do app respeitam preferências configuradas

---

# Fase 8 — exportação e relatório

## Objetivo
Transformar os dados em artefato útil para doula/hospital.

## Escopo
- resumo compartilhável estruturado
- versão imprimível
- PDF futuro

## Mudanças técnicas
### 1. Primeiro passo
Gerar relatório HTML imprimível antes de PDF.

### 2. Conteúdo do relatório
- dados temporais
- tendência
- sinais de alerta
- observações
- perfil/contexto
- recomendação atual

## Critérios de aceite
- usuário consegue gerar um resumo claro da sessão
- relatório apresenta contexto e não só números

---

# Fase 9 — testes

## Objetivo
Dar segurança para evolução clínica do app.

## Escopo
Adicionar testes para:
- cálculos de 1h/2h
- tendência
- 5-1-1
- regras por perfil
- preferências clínicas
- prioridades de sinais de alerta

## Arquivos alvo
- `src/utils/contractionUtils.test.js`
- `src/utils/phaseRules.test.js`

## Critérios de aceite
- cenários principais cobertos
- regressões detectáveis

---

# Ordem recomendada de execução

1. Fase 1 — observações e base de sessão
2. Fase 2 — janela temporal real
3. Fase 3 — tendência temporal
4. Fase 4 — motor de regras explícito
5. Fase 5 — regra 5-1-1
6. Fase 6 — perfil por usuária
7. Fase 7 — regras configuráveis
8. Fase 8 — exportação e relatório
9. Fase 9 — testes

---

# Estratégia geral

- começar pequeno
- manter compatibilidade com o fluxo atual
- evitar refatorar tudo de uma vez
- introduzir novas regras com testes
- sempre priorizar explicabilidade das recomendações

---

# Observação final

O app deve continuar como apoio ao monitoramento, sem substituir avaliação médica. O foco é melhorar a utilidade clínica prática, a clareza da recomendação e o valor do produto.
