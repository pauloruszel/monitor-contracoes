# Melhorias futuras — dados complementares por sessão

## Objetivo
Evoluir o app para registrar e usar dados complementares por sessão, melhorando a utilidade clínica prática sem caráter diagnóstico.

## Melhorias a implementar

### 1. Observações
Adicionar campo de observações por sessão e/ou por evento para registrar contexto livre, por exemplo:
- dor em lombar
- exaustão
- vômito
- ansiedade
- orientação recebida da doula
- horário percebido de bolsa rota

**Vantagem clínica:** capturar nuances que números não mostram e enriquecer o histórico para compartilhamento com doula/equipe.

### 2. Contexto obstétrico
Adicionar dados de contexto da usuária/sessão, por exemplo:
- primeira gestação / já teve partos
- idade gestacional
- bolsa rota
- parto anterior rápido
- pré-termo
- histórico relevante

**Vantagem clínica:** permitir que o mesmo padrão de contrações seja interpretado com mais contexto e mais utilidade prática.

### 3. Preferências clínicas
Permitir configuração de condutas e thresholds conforme orientação combinada, por exemplo:
- avisar a doula mais cedo
- usar critério 5-1-1
- ajustar sensibilidade de alerta
- customizar gatilhos de recomendação

**Vantagem clínica:** alinhar o app com a orientação profissional e reduzir recomendações excessivamente genéricas.

### 4. Dados que alimentem recomendações melhores
Usar os dados acima para tornar recomendações mais contextuais, por exemplo:
- considerar exaustão, desconforto e sinais associados
- ajustar recomendação por contexto obstétrico
- priorizar sinais importantes sobre padrão temporal

**Vantagem clínica:** transformar o app de contador com médias em apoio contextual à decisão prática.

## Benefícios esperados
- recomendações mais úteis e individualizadas
- melhor compartilhamento com doula/equipe
- maior valor percebido do produto
- base melhor para alertas e relatórios futuros

## Pontos do código onde isso pode evoluir
- `src/App.jsx`
- `src/utils/phaseRules.js`
- `src/utils/contractionUtils.js`
- novos componentes/formulários para sessão e observações

## Observação
Essas melhorias devem manter o app como apoio de monitoramento, sem substituir avaliação médica.
