# Monitor de Contracoes

Aplicativo web para acompanhar contracoes durante o trabalho de parto, com foco no uso pratico pelo acompanhante e com opcao de compartilhamento em tempo real com a doula.

## Visao Geral

O projeto foi desenhado para uso simples no celular, com prioridade para:

- registrar contracoes com poucos toques
- interpretar o padrao recente sem contas manuais
- destacar a proxima acao sugerida
- registrar sinais de alerta relevantes
- compartilhar a sessao com a doula quando necessario

O app continua sendo **offline-first** no modo principal. O Firebase e usado apenas no modo compartilhado.

> Importante: este app e um apoio de monitoramento e nao substitui orientacao medica, obstetrica ou da doula.

## Estado Atual do App

### Monitoramento principal

- Inicio e fim de cada contracao
- Cronometro em tempo real
- Calculo automatico de duracao e intervalo
- Duracao media e intervalo medio
- Historico local persistido no navegador

### Leitura do momento

- Leitura do padrao atual
- Conduta sugerida no topo da tela
- Separacao entre observacao, interpretacao, acao e limitacao
- Linha de ajuste explicando quando contexto clinico influenciou a leitura
- Tendencia recente com base em janelas temporais de 1h e 2h

### Contexto clinico local

- Contexto da sessao estruturado
- Notas livres da sessao
- Perfil da gestacao
- Preferencias clinicas locais
- Bem-estar durante a contracao

### Sinais de alerta

- Perda do tampao
- Bolsa rompeu
- Liquido verde ou marrom
- Menos movimentos do bebe
- Sangramento
- Cheiro ruim ou febre
- Menos de 37 semanas

### Compartilhamento com a doula

- Sessao remota temporaria no Firebase Realtime Database
- Link de leitura para a doula
- Tela remota com atualizacao em tempo quase real
- Resumo do contexto da sessao no modo doula
- Mesmo contrato de decisao do modo principal
- Encerramento e remocao da sessao compartilhada

### Alertas

- Notificacao do navegador
- Voz sintetizada
- Som curto
- Destaque visual na interface

## Arquitetura Atual

A aplicacao separa o motor clinico em camadas explicitas para reduzir acoplamento entre logica, copy e interface.

### Camadas do motor

- `src/engine/temporalPatternEngine.js`
  Calcula a leitura temporal do padrao com base em intervalos, duracao media e irregularidade.
- `src/engine/warningSignalEngine.js`
  Avalia sinais de alerta e define prioridades clinicas que podem sobrepor o padrao temporal.
- `src/engine/obstetricContextEngine.js`
  Aplica contexto obstetrico e preferencias locais a leitura e a conduta.
- `src/engine/carePlanEngine.js`
  Constroi a conduta base em formato seguro: observacao, interpretacao, acao e limitacao.
- `src/engine/decisionEngine.js`
  Orquestra todas as camadas, aplica precedencia e retorna a decisao consolidada.

### Contrato interno da decisao

O motor usa um contrato neutro, centrado em `pattern`, e nao em `phase` como conceito principal.

```js
{
  version,
  input,
  pattern,
  temporalPattern,
  warningSignal,
  actionPlan,
  readingAdjustmentReasons,
  actionAdjustmentReasons,
  decision,
}
```

### Precedencia formal

A precedencia atual e definida em `src/content/decisionCopy.js`:

- `warning_signal_critical`
- `warning_signal_warning`
- `wellbeing_severe`
- `wellbeing_attention`
- `temporal_pattern`

Isso garante que alerta clinico venha antes do ritmo, e que bem-estar possa ajustar a conduta sem fingir mudanca diagnostica de fase.

### Copy e adaptacao de UI

- `src/content/clinicalCopy.js`
  Copy clinica de padrao e sinais de alerta.
- `src/content/decisionCopy.js`
  Copy de precedencia, labels e versao do motor.
- `src/content/contextCopy.js`
  Copy do contexto da sessao e razoes de ajuste.
- `src/adapters/decisionViewModel.js`
  Adaptador que transforma a decisao do motor em dados prontos para o card principal e para o modo doula.

## Estrutura do Projeto

```text
src/
  adapters/
  components/
  content/
  engine/
  lib/
  pages/
  services/
  utils/
  App.jsx
  main.jsx
  styles.css
```

## Requisitos

- Node.js 20+
- npm
- Projeto Firebase com Realtime Database habilitado

## Rodando Localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Criar `.env.local`

Use as mesmas chaves documentadas em `.env.example`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:your_app_id
```

Esses valores sao consumidos por `src/lib/firebase.js`.

### 3. Rodar o projeto

```bash
npm run dev
```

### 4. Acessar no navegador

```text
http://localhost:5173/monitor-contracoes/
```

## Variaveis de Ambiente

Variaveis esperadas no projeto:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Firebase Realtime Database

O Firebase e usado apenas no modo compartilhado. Sem compartilhamento ativo, os dados ficam locais no navegador.

### Fluxo do compartilhamento

1. A usuaria inicia o compartilhamento.
2. O app cria uma sessao temporaria no Realtime Database.
3. Contracoes, sinais de alerta e contexto da sessao sao sincronizados.
4. A doula acessa a sessao por link com hash route.
5. A sessao pode ser encerrada ou removida.

### Estrutura principal no banco

```text
sessions/
  {sessionId}/
    id
    shareToken
    writerToken
    status
    doulaPhone
    createdAt
    updatedAt
    contractions/
      {contractionId}/
    warningSignals/
    sessionContext
    userProfile
    clinicalPreferences
```

### Estrutura atual do contexto da sessao

```text
sessionContext/
  homeObservationGuidance
  longTravelToHospital
  bagReady
  notes
```

### Regras atuais

- Sem autenticacao Firebase no MVP
- Sessao criada so quando o compartilhamento e ativado
- `shareToken` para leitura pela doula
- `writerToken` para escrita da usuaria
- Estrutura simples, sem joins nem backend adicional
- Compatibilidade local com legado de `sessionNotes`, migrado para `sessionContext.notes`

## Testes

### Rodar testes

```bash
npm test
```

### Rodar build

```bash
npm run build
```

## Observacoes Importantes

- O modo principal do app continua local e persistido no navegador.
- O Firebase nao substitui o modo offline; ele so complementa o compartilhamento.
- O link da doula e somente leitura.
- Alertas clinicos tem prioridade sobre o ritmo temporal.
- O app usa heuristicas explicaveis para leitura do padrao, nao confirmacao diagnostica de fase.
- O motor esta versionado em `DECISION_ENGINE_VERSION` para auditoria futura.

## Roadmap Imediato

- Revisar o conteudo clinico com validacao profissional formal
- Refinar a apresentacao visual de observacao, interpretacao e acao no card principal
- Evoluir protecao por token e regras de acesso no Realtime Database
- Melhorar cobertura de testes de interface e fluxo remoto
- Preparar exportacao de sessao e relatorio estruturado para doula e equipe

## Licenca

Uso privado do projeto, conforme a necessidade do repositorio.
