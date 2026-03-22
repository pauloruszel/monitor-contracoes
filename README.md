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

Além do uso local, o app possui integração com **Supabase** para permitir sessões compartilhadas e leitura remota pela doula.

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
- Sessão compartilhada em tempo real com Supabase
- Tela remota de leitura para a doula

---

## 🧱 Stack Tecnológica

- **Frontend:** React + JavaScript
- **Build Tool:** Vite
- **Estilo:** CSS simples
- **Visualização:** SVG puro para timeline
- **Backend / Realtime:** Supabase
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
- Projeto Supabase configurado

---

## ▶️ Rodando Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxx
```

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

## ☁️ Supabase

O MVP de compartilhamento utiliza três tabelas principais:

- `sessions`
- `contractions`
- `warning_signals`

### Fluxo de Funcionamento

1. O acompanhante inicia uma sessão compartilhada
2. O app cria tokens e registra a sessão no Supabase
3. Contrações e sinais de alerta são sincronizados
4. A doula acessa via link com hash route
5. A interface da doula atualiza em tempo quase real

### Variáveis Necessárias

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Deploy

O projeto está preparado para deploy estático via GitHub Pages.

### Build

```bash
npm run build
```

### Publicação

O GitHub Actions publica automaticamente a branch `main`.

### Configuração de Variáveis em Produção

No repositório, acesse:

`Settings` → `Secrets and variables` → `Actions` → `Variables`

Crie:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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
- O compartilhamento depende da configuração do Supabase
- O link da doula é somente leitura
- O app não realiza diagnóstico clínico
- Sinais de alerta devem ter prioridade sobre dados temporais

---

## 🛣️ Roadmap Sugerido

- Exportação e importação de backup
- Transformar em PWA instalável
- Melhorias na robustez do realtime
- Implementação de políticas RLS para segurança
- UX otimizada para uso noturno

---

## 📄 Licença

Uso privado do projeto, conforme necessidade do repositório.
