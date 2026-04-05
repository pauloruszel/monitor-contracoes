# Roadmap clínico — evolução do monitor de contrações

## Objetivo
Consolidar melhorias futuras para evoluir o app de monitoramento simples para um assistente mais robusto de acompanhamento do trabalho de parto, sem caráter diagnóstico.

---

# 1. Janela temporal real

## Melhoria
Substituir/complementar análise por quantidade de eventos com análise por tempo:
- últimas 1 hora
- últimas 2 horas

## Objetivo clínico
- avaliar progressão real
- reduzir ruído de amostras pequenas
- melhorar consistência da interpretação

---

# 2. Tendência temporal

## Melhoria
Calcular evolução ao longo do tempo:
- intervalo médio por janela
- duração média por janela
- tendência (encurtando / estável / espaçando)
- regularidade do padrão

## Objetivo clínico
Permitir leitura de progressão, não apenas fotografia do momento.

---

# 3. Motor de regras explícito

## Melhoria
Evoluir `phaseRules.js` para regras mais claras e combináveis.

### Incluir:
- regra 5-1-1
- regras configuráveis
- perfil por usuária

## Objetivo clínico
- maior transparência
- melhor explicação das recomendações
- adaptação ao contexto individual

---

# 4. Regra 5-1-1

## Definição
- contrações a cada 5 minutos
- duração ~1 minuto
- mantidas por 1 hora

## Objetivo clínico
- referência conhecida
- critério simples para decisão prática

---

# 5. Regras configuráveis

## Melhoria
Permitir customização de:
- thresholds de intervalo
- thresholds de duração
- sensibilidade de alertas
- gatilhos de recomendação

## Objetivo clínico
Alinhar o app com orientação médica/doula.

---

# 6. Perfil por usuária

## Melhoria
Adicionar perfil mínimo:
- primeira gestação / já teve partos
- idade gestacional
- contexto relevante

## Objetivo clínico
Permitir interpretação mais adequada do padrão.

---

# 7. Dados complementares por sessão

## 7.1 Observações
Campo livre para contexto adicional.

## 7.2 Contexto obstétrico
Dados da gestação que influenciam interpretação.

## 7.3 Preferências clínicas
Configuração conforme orientação profissional.

## 7.4 Dados para recomendações melhores
Combinar todos os dados para recomendações mais úteis.

---

# Benefícios gerais

- maior robustez clínica (sem diagnóstico)
- melhor interpretação do padrão
- redução de falsos alarmes
- maior valor percebido
- base para evolução para SaaS

---

# Pontos do código para evolução

- src/utils/contractionUtils.js
- src/utils/phaseRules.js
- src/App.jsx
- novos módulos de perfil e sessão

---

# Observação final

O app deve continuar sendo um apoio de monitoramento e não substituir avaliação médica.
