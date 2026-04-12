# Monitor de Contrações

Aplicativo web para acompanhar contrações durante o trabalho de parto, com foco no uso prático pelo acompanhante e opção de compartilhamento em tempo real com a doula.

## Visão Geral

O projeto foi desenhado para uso simples no celular, com prioridade para:

- registrar contrações com poucos toques
- interpretar o padrão recente sem contas manuais
- destacar a próxima ação sugerida
- registrar sinais de alerta relevantes
- compartilhar a sessão com a doula quando necessário

O app continua sendo **offline-first** no modo normal. O Firebase é usado apenas no modo compartilhado.

> Importante: este app é um apoio de monitoramento e não substitui orientação médica, obstétrica ou da doula.

## O Que O App Faz Hoje

### Monitoramento principal

- Início e fim de cada contração
- Cronômetro em tempo real
- Cálculo automático de duração e intervalo
- Duração média e intervalo médio
- Histórico local persistido no navegador

### Leitura do momento

- Fase provável do padrão atual
- Conduta sugerida no topo da tela
- Motivo curto para a recomendação
- Linha de ajuste explicando quando contexto clínico influenciou a leitura
- Tendência recente com base em janelas temporais de 1h e 2h

### Contexto clínico local

- Contexto da sessão estruturado
- Notas livres da sessão
- Perfil da gestação
- Preferências clínicas locais
- Bem-estar durante a contração

### Sinais de alerta

- Perda do tampão
- Bolsa rompeu
- Líquido verde ou marrom
- Menos movimentos do bebê
- Sangramento
- Cheiro ruim ou febre
- Menos de 37 semanas

### Compartilhamento com a doula

- Sessão remota temporária no Firebase Realtime Database
- Link de leitura para a doula
- Tela remota com atualização em tempo quase real
- Resumo do contexto da sessão no modo doula
- Mesma lógica de leitura clínica do modo principal
- Encerramento e remoção da sessão compartilhada

### Alertas

- Notificação do navegador
- Voz sintetizada
- Som curto
- Destaque visual na interface

## Arquitetura Atual da Interface

A tela principal foi reorganizada para reduzir carga cognitiva em uso real:

- **Nível 1: decisão**
  Topo decisório com fase provável, conduta sugerida, motivo curto, ajuste por contexto e linha numérica de conferência.
- **Nível 2: ação**
  Bloco de contração com cronômetro e botão principal para iniciar ou encerrar.
- **Nível 3: contexto**
  Sinais de alerta, métricas resumidas e blocos colapsáveis para timeline, histórico, contexto da sessão e compartilhamento.

O modo doula segue a mesma lógica visual, mas com foco em leitura remota em vez de operação, incluindo contexto da sessão e explicação de ajustes ativos.

## Stack

- React
- Vite
- CSS
- SVG puro para timeline
- Firebase Realtime Database
- Vitest

## Estrutura do Projeto

```text
src/
  components/
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

### 1. Instalar dependências

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

Esses valores são consumidos por `src/lib/firebase.js`.

### 3. Rodar o projeto

```bash
npm run dev
```

### 4. Acessar no navegador

```text
http://localhost:5173/monitor-contracoes/
```

## Variáveis de Ambiente

Variáveis esperadas no projeto:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Firebase Realtime Database

O Firebase é usado apenas no modo compartilhado. Sem compartilhamento ativo, os dados ficam locais no navegador.

### Fluxo do compartilhamento

1. A usuária inicia o compartilhamento.
2. O app cria uma sessão temporária no Realtime Database.
3. Contrações, sinais de alerta e contexto da sessão são sincronizados.
4. A doula acessa a sessão por link com hash route.
5. A sessão pode ser encerrada ou removida.

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

### Estrutura atual do contexto da sessão

```text
sessionContext/
  homeObservationGuidance
  longTravelToHospital
  bagReady
  notes
```

### Regras atuais

- Sem autenticação Firebase no MVP
- Sessão criada só quando o compartilhamento é ativado
- `shareToken` para leitura pela doula
- `writerToken` para escrita da usuária
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

## Deploy

O projeto está preparado para deploy estático via GitHub Pages.

### Workflow

O deploy automático ocorre a partir da branch `main` via `.github/workflows/deploy.yml`.

### Repository Variables esperadas no GitHub

Configure em:

`Settings` -> `Secrets and variables` -> `Actions` -> `Variables`

Variáveis necessárias:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Observações Importantes

- O modo normal do app continua local e persistido no navegador.
- O Firebase não substitui o modo offline; ele só complementa o compartilhamento.
- O link da doula é somente leitura.
- Alertas clínicos têm prioridade sobre o ritmo temporal.
- O app usa heurísticas explicáveis para leitura do padrão, não confirmação diagnóstica de fase.

## Roadmap Imediato

- Revisar o conteúdo clínico com validação profissional formal
- Refinar regras de leitura temporal e reduzir linguagem excessivamente diagnóstica
- Evoluir proteção por token e regras de acesso no Realtime Database
- Melhorar cobertura de testes de interface e fluxo remoto
- Preparar exportação de sessão e relatório estruturado para doula/equipe

## Licença

Uso privado do projeto, conforme a necessidade do repositório.
