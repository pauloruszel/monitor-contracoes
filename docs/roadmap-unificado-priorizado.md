# Roadmap unificado priorizado

## Objetivo
Consolidar os roadmaps de UX/UI, evolução clínica, dados complementares por sessão e plano técnico em uma única visão priorizada, orientada por impacto no produto, dependências técnicas e risco de regressão.

## Princípios de priorização
- preservar o fluxo atual e o modo offline-first
- manter o app como apoio ao monitoramento, sem caráter diagnóstico
- priorizar explicabilidade das recomendações
- evitar refatorações amplas antes de ter dados e regras mais claros
- evoluir a UX em cima de sinais clínicos melhores, não só em cima de layout

---

## Prioridade 1 — base de sessão e contexto

### Objetivo
Adicionar contexto útil por sessão sem mexer ainda no núcleo das regras.

### Entregas
- observações por sessão
- perfil básico da usuária
- preferências clínicas
- persistência local
- preparo do payload para compartilhamento com Firebase

### Impacto
- aumenta valor clínico prático rapidamente
- cria base para recomendações melhores
- destrava as próximas fases do motor de decisão

### Arquivos principais
- `src/App.jsx`
- `src/utils/storage.js`
- novos componentes de sessão e perfil

### Critério de aceite
- dados novos persistem localmente
- não quebram timer, histórico, alertas nem compartilhamento

---

## Prioridade 2 — análise temporal real

### Objetivo
Trocar a dependência exclusiva dos últimos 5 eventos por leitura baseada em janelas de tempo.

### Entregas
- métricas das últimas 1h
- métricas das últimas 2h
- helpers dedicados em `contractionUtils`
- compatibilidade com o histórico atual

### Impacto
- reduz ruído de amostras pequenas
- melhora consistência clínica
- prepara base para tendência e 5-1-1

### Arquivos principais
- `src/utils/contractionUtils.js`
- `src/App.jsx`

### Critério de aceite
- app calcula médias e intervalos por janela temporal real
- histórico antigo continua utilizável

---

## Prioridade 3 — tendência e leitura de progressão

### Objetivo
Transformar o app de fotografia do momento em leitura de progressão.

### Entregas
- tendência de intervalo: encurtando, estável, espaçando
- tendência de duração: aumentando, estável, reduzindo
- regularidade do padrão
- resumo de tendência reutilizável

### Impacto
- melhora decisão prática
- enriquece recomendação e modo doula
- cria base para timeline interpretável

### Arquivos principais
- `src/utils/contractionUtils.js`
- `src/components/MetricsCard.jsx`
- `src/components/RecommendationCardV2.jsx`
- `src/components/TimelineChart.jsx`

### Critério de aceite
- o app mostra se o padrão está progredindo ou não
- a recomendação usa tendência de forma explicável

---

## Prioridade 4 — motor de regras explícito

### Objetivo
Refatorar `phaseRules.js` para regras modulares, testáveis e extensíveis.

### Entregas
- separação entre regras de fase, alerta e ajustes por contexto
- funções explícitas de avaliação
- base para perfil, preferências e 5-1-1

### Impacto
- reduz acoplamento
- facilita evolução clínica segura
- melhora transparência da decisão

### Arquivos principais
- `src/utils/phaseRules.js`
- `src/utils/phaseRules.test.js`

### Critério de aceite
- regras ficam testáveis isoladamente
- sinais de alerta continuam tendo prioridade

---

## Prioridade 5 — UX orientada à decisão

### Objetivo
Reorganizar a interface com base na nova qualidade dos sinais do produto.

### Entregas
- hierarquia em 3 níveis: decisão, ação e contexto
- card de recomendação unificado e explicável
- dominância visual de alertas críticos
- área de contexto da sessão sob demanda
- melhorias de uso com uma mão e contraste mobile

### Impacto
- reduz carga cognitiva
- melhora clareza em situação de estresse
- aumenta confiança no app

### Arquivos principais
- `src/App.jsx`
- `src/styles.css`
- componentes de recomendação, alertas, métricas e contexto

### Critério de aceite
- decisão principal fica sempre evidente
- contexto extra não polui a tela principal

---

## Prioridade 6 — 5-1-1, perfil e preferências

### Objetivo
Adicionar personalização clínica explícita depois que o motor de regras estiver modularizado.

### Entregas
- regra 5-1-1
- influência do perfil obstétrico
- regras configuráveis
- explicação clara de quando esses fatores influenciaram a recomendação

### Impacto
- aumenta utilidade clínica prática
- reduz recomendações genéricas
- aproxima o app do uso real com orientação profissional

### Arquivos principais
- `src/utils/phaseRules.js`
- `src/App.jsx`
- componentes de preferências e perfil

### Critério de aceite
- o app reconhece 5-1-1
- perfil e preferências afetam a recomendação sem comportamento opaco

---

## Prioridade 7 — modo doula e compartilhamento estruturado

### Objetivo
Aprimorar a experiência remota depois que tendência, contexto e explicabilidade estiverem prontos.

### Entregas
- modo doula mais limpo e focado
- destaque para alertas, tendência e timeline ampliada
- resumo compartilhável estruturado
- preview de conteúdo compartilhado

### Impacto
- aumenta valor percebido do compartilhamento
- melhora uso remoto com doula ou equipe

### Arquivos principais
- `src/pages/DoulaViewPage.jsx`
- `src/services/firebaseSharingService.js`
- novos componentes de resumo/exportação

### Critério de aceite
- doula consegue entender situação e progressão sem excesso de ruído

---

## Prioridade 8 — exportação e relatório

### Objetivo
Transformar a sessão em artefato útil para doula, equipe ou impressão.

### Entregas
- relatório HTML imprimível
- resumo estruturado da sessão
- base para PDF futuro

### Conteúdo esperado
- métricas temporais
- tendência
- sinais de alerta
- observações
- perfil/contexto
- recomendação atual

### Impacto
- amplia utilidade fora do app
- aumenta valor para acompanhamento profissional

---

## Prioridade 9 — microinterações e refinamentos visuais

### Objetivo
Melhorar percepção de resposta e acabamento do produto sem mexer no núcleo clínico.

### Entregas
- animação ao iniciar e encerrar contração
- transição ao mudar fase
- feedback visual de alertas
- refinamentos no modo noturno

### Impacto
- melhora sensação de confiabilidade
- aumenta qualidade percebida

### Observação
- deve vir depois da arquitetura e da hierarquia principal, não antes

---

## Prioridade 10 — cobertura de testes

### Objetivo
Dar segurança para a evolução clínica e de produto.

### Cobertura alvo
- janelas de 1h e 2h
- tendência
- 5-1-1
- regras por perfil
- preferências clínicas
- prioridades de sinais de alerta

### Arquivos principais
- `src/utils/contractionUtils.test.js`
- `src/utils/phaseRules.test.js`

### Observação
- testes devem crescer junto com as fases 2 a 7, não só no final

---

## Ordem recomendada de execução

1. Base de sessão e contexto
2. Análise temporal real
3. Tendência e progressão
4. Motor de regras explícito
5. UX orientada à decisão
6. 5-1-1, perfil e preferências
7. Modo doula e compartilhamento estruturado
8. Exportação e relatório
9. Microinterações e refinamentos visuais
10. Cobertura de testes ampliada

---

## Dependências importantes

- contexto de sessão deve existir antes de recomendações mais inteligentes
- janela temporal e tendência devem existir antes da UX explicável final
- motor de regras deve ser modular antes de personalização clínica relevante
- modo doula refinado depende de tendência, contexto e recomendação explicável
- exportação só ganha valor quando os dados complementares já existirem

---

## Próximo passo recomendado

O próximo passo mais eficiente no código é implementar a Prioridade 1:
- `sessionNotes`
- `userProfile`
- `clinicalPreferences`

Ela entrega valor prático sem alto risco, preserva o fluxo atual e prepara corretamente as próximas fases.
