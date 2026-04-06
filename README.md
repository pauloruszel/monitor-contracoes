# Monitor de Contrações

Aplicativo web para acompanhamento de contrações durante o trabalho de parto, com foco em uso prático pelo acompanhante e possibilidade de compartilhamento em tempo real com a doula.

---

## 📌 Visão Geral

O projeto foi desenvolvido para:

- Registrar contrações
- Calcular padrões automaticamente
- Indicar a fase provável do trabalho de parto
- Sugerir recomendações práticas
- Exibir uma timeline visual

Além do uso local, o app possui integração com **Firebase Realtime Database** para permitir sessões compartilhadas e leitura remota pela doula.

> ⚠️ **Importante:** Este app é apenas um apoio de monitoramento e **não substitui orientação médica**.

---

## 🚀 Principais Funcionalidades

### ⏱️ Monitoramento de Contrações

- Registro de início e fim
- Cronômetro em tempo real
- Cálculo automático de:
  - Duração de cada contração
  - Intervalo entre contrações
  - Duração média
  - Intervalo médio

### 📊 Classificação da Fase

- Pródromos / início
- Fase latente
- Fase ativa
- Transição

### 💡 Recomendações

- Sugestões práticas baseadas no momento atual

### 😊 Módulo de Conforto

- Bem
- Mais desconfortável
- Muita dor

### ⚠️ Sinais de Alerta

- Perda do tampão
- Bolsa rompeu
- Líquido com mecônio
- Menos movimentos do bebê
- Sangramento
- Cheiro ruim ou febre
- Menos de 37 semanas

### 🔔 Alertas Automáticos

- Notificações no navegador
- Voz sintetizada
- Som curto

### 📈 Visualização e Histórico

- Timeline visual das contrações
- Histórico persistido localmente

### 🤝 Compartilhamento com Doula

- Botão de contato via WhatsApp
- Sessão compartilhada em tempo real com Firebase Realtime Database
- Tela remota de leitura para a doula

---

## 🧱 Stack Tecnológica

- **Frontend:** React + JavaScript
- **Build Tool:** Vite
- **Estilo:** CSS simples
- **Visualização:** SVG puro para timeline
- **Backend / Realtime:** Firebase Realtime Database
- **Testes:** Vitest

---

## 📁 Estrutura do Projeto

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

---

## ⚙️ Requisitos

- Node.js 20+
- npm
- Projeto Firebase com Realtime Database configurado

---

## ▶️ Rodando Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configuração do Firebase

Revise os dados de configuração em `src/lib/firebase.js` e confirme que o projeto Firebase e o Realtime Database corretos estão sendo usados.

### 3. Iniciar o projeto

```bash
npm run dev
```

### 4. Acessar no navegador

```text
http://localhost:5173/monitor-contracoes/
```

---

## 🧪 Testes

### Executar testes

```bash
npm test
```

### Executar com cobertura

```bash
npm run test:coverage
```

---

## ☁️ Firebase Realtime Database

O MVP de compartilhamento utiliza uma estrutura hierárquica simples no Realtime Database:

- `sessions/{sessionId}`
- `sessions/{sessionId}/contractions/{contractionId}`
- `sessions/{sessionId}/warningSignals`

### Fluxo de Funcionamento

1. O acompanhante inicia uma sessão compartilhada
2. O app cria tokens e registra a sessão no Firebase Realtime Database
3. Contrações e sinais de alerta são sincronizados
4. A doula acessa via link com hash route
5. A interface da doula atualiza em tempo quase real

### Estrutura principal

- `id`
- `shareToken`
- `writerToken`
- `status`
- `doulaPhone`
- `createdAt`
- `updatedAt`
- `contractions`
- `warningSignals`

---

## 🚀 Deploy

O projeto está preparado para deploy estático via GitHub Pages.

### Build

```bash
npm run build
```

### Publicação

O GitHub Actions publica automaticamente a branch `main`.

### Configuração em Produção

Garanta que o app publicado esteja apontando para o projeto Firebase correto e que o Realtime Database esteja habilitado com regras compatíveis com o estágio atual do produto.

---

## 📱 UX do Produto

Foco total em uso real no celular:

- Ações principais sempre visíveis
- Leitura rápida do estado atual
- Cards com hierarquia de informação
- Histórico recolhível
- Sinais de alerta recolhíveis
- Modo doula com leitura simplificada

---

## ⚠️ Observações Importantes

- Funciona localmente com persistência no navegador
- O compartilhamento depende da configuração do Firebase Realtime Database
- O link da doula é somente leitura
- O app não realiza diagnóstico clínico
- Sinais de alerta devem ter prioridade sobre dados temporais

---

## 🛣️ Roadmap Sugerido

- Exportação e importação de backup
- Transformar em PWA instalável
- Melhorias na robustez do realtime
- Regras de acesso por token no Realtime Database
- UX otimizada para uso noturno

---

## 📄 Licença

Uso privado do projeto, conforme necessidade do repositório.
