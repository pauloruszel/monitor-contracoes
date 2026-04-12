import React from 'react'

function ManualModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="manual-overlay" role="dialog" aria-modal="true" aria-labelledby="manual-title">
      <div className="manual-modal">
        <div className="card-header">
          <div>
            <p className="eyebrow">Ajuda rápida</p>
            <h2 id="manual-title">Manual de uso</h2>
          </div>
          <button className="button button-close" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="manual-content">
          <section>
            <p>
              O Monitor de Contrações ajuda o acompanhante a registrar contrações, observar o padrão
              recente e tomar decisões práticas com menos esforço. O app continua sendo
              <strong> local/offline-first</strong>: tudo funciona no aparelho mesmo sem internet.
            </p>
            <p>
              O Firebase só entra em cena quando você ativa o <strong>compartilhamento com a doula</strong>.
              Fora disso, os dados ficam locais no próprio dispositivo.
            </p>
            <p>
              O app <strong>não faz diagnóstico médico</strong> e <strong>não substitui</strong> orientação
              da doula, da equipe obstétrica ou do hospital.
            </p>
          </section>

          <section>
            <h3>Antes de começar</h3>
            <ul>
              <li>Se quiser usar como app, instale na tela inicial do celular antes do uso real.</li>
              <li>Confirme se o número da doula está correto na área de contato rápido.</li>
              <li>Ative os alertas automáticos se quiser receber notificação, voz e som.</li>
              <li>Deixe o celular carregado e por perto.</li>
              <li>Combine um critério simples para marcar início e fim da contração.</li>
              <li>Se a doula for acompanhar à distância, inicie o compartilhamento antes da sessão real.</li>
            </ul>
          </section>

          <section>
            <h3>Como a tela está organizada agora</h3>
            <ul>
              <li>
                <strong>Topo de decisão</strong>: mostra fase provável, conduta principal e um motivo curto.
              </li>
              <li>
                <strong>Bloco de ação</strong>: cronômetro e botão principal para iniciar ou encerrar a contração.
              </li>
              <li>
                <strong>Contexto prioritário</strong>: sinais de alerta e métricas resumidas.
              </li>
              <li>
                <strong>Contexto secundário</strong>: timeline, histórico, notas, perfil, preferências e compartilhamento.
              </li>
            </ul>
            <p>
              A ideia é simples: primeiro entender <strong>o que está acontecendo</strong>, depois fazer
              <strong> a próxima ação</strong>, e só então abrir detalhes se precisar.
            </p>
          </section>

          <section>
            <h3>Como registrar uma contração</h3>
            <ul>
              <li>Toque em <strong>Iniciar contração</strong> quando ela começar.</li>
              <li>Toque em <strong>Encerrar contração</strong> quando ela terminar.</li>
              <li>Repita isso a cada contração, sempre com o mesmo critério.</li>
              <li>O app salva automaticamente horário de início, fim e duração.</li>
              <li>Evite reconstruir depois. Registrar no momento é mais importante que acertar milimetricamente.</li>
            </ul>
          </section>

          <section>
            <h3>Como usar o bem-estar</h3>
            <p>
              O bloco <strong>Como ela está agora</strong> complementa a leitura do tempo. Ele fica visível o
              tempo todo, mas só é editável durante a contração em andamento.
            </p>
            <ul>
              <li><strong>Bem</strong>: ela está lidando bem com a contração.</li>
              <li><strong>Mais desconfortável</strong>: o momento está exigindo mais atenção e apoio.</li>
              <li><strong>Muita dor</strong>: dor intensa ou sofrimento importante nas contrações recentes.</li>
            </ul>
          </section>

          <section>
            <h3>O que o app calcula automaticamente</h3>
            <ul>
              <li>Duração de cada contração.</li>
              <li>Intervalo entre os inícios das contrações.</li>
              <li>Duração média recente.</li>
              <li>Intervalo médio recente.</li>
              <li>Tendência do padrão nas janelas mais recentes.</li>
              <li>Leitura do padrão e conduta sugerida.</li>
            </ul>
            <p>
              A análise principal continua priorizando o momento atual. O histórico ajuda como contexto,
              mas não substitui a leitura do padrão mais recente.
            </p>
          </section>

          <section>
            <h3>Como ler o topo de decisão</h3>
            <ul>
              <li><strong>Leitura do padrão</strong>: como o app interpreta o ritmo recente.</li>
              <li><strong>Conduta</strong>: a próxima ação prática sugerida.</li>
              <li><strong>Por quê</strong>: uma frase curta interpretando o ritmo ou alertando prioridade clínica.</li>
              <li><strong>Linha numérica</strong>: intervalo e duração médios para conferência rápida.</li>
            </ul>
            <p>
              Se a tela entrar em estado de atenção alta ou crítico, o topo passa a dominar visualmente.
              Isso é intencional: a prioridade deixa de ser explorar a tela e passa a ser agir.
            </p>
          </section>

          <section>
            <h3>Como interpretar as leituras do padrão</h3>
            <ul>
              <li>
                <strong>Padrão inicial ou espaçado</strong>: ritmo ainda mais aberto ou pouco
                consistente. Em geral, a orientação é continuar em casa, descansar, comer e se
                hidratar.
              </li>
              <li>
                <strong>Padrão compatível com fase latente</strong>: contrações mais frequentes, que podem justificar aviso à doula e observação próxima.
              </li>
              <li>
                <strong>Padrão mais intenso e mais próximo</strong>: contrações mais próximas e mais consistentes. O app pode sugerir preparar a ida.
              </li>
              <li>
                <strong>Padrão muito frequente</strong>: intervalos muito curtos e urgência maior. O app sugere procurar avaliação agora.
              </li>
            </ul>
          </section>

          <section>
            <h3>Sinais de alerta importantes</h3>
            <p>
              O card <strong>Sinais de alerta</strong> existe para registrar situações que podem ter prioridade
              sobre o ritmo das contrações.
            </p>
            <ul>
              <li><strong>Bolsa rompeu</strong>: vale falar com a maternidade ou equipe.</li>
              <li><strong>Líquido verde ou marrom</strong>: pode exigir avaliação rápida.</li>
              <li><strong>Menos movimentos do bebê</strong>: procurar orientação imediatamente.</li>
              <li><strong>Sangramento</strong>: procurar avaliação.</li>
              <li><strong>Cheiro ruim ou febre</strong>: procurar avaliação.</li>
              <li><strong>Menos de 37 semanas</strong>: aumenta a cautela do contexto.</li>
            </ul>
            <p>
              Quando houver alerta ativo, ele pode abrir sozinho e assumir prioridade na leitura da tela.
            </p>
          </section>

          <section>
            <h3>Notas, perfil e preferências</h3>
            <p>
              A seção <strong>Contexto da sessão</strong> reúne três blocos que ajudam a leitura futura e o
              compartilhamento com a doula.
            </p>
            <ul>
              <li><strong>Observações da sessão</strong>: anotações livres como dor lombar, vômito ou orientação recebida.</li>
              <li><strong>Perfil da gestação</strong>: primeira gestação, semanas e parto anterior rápido.</li>
              <li><strong>Preferências clínicas</strong>: ajustes locais como sensibilidade de alerta e aviso mais cedo à doula.</li>
            </ul>
          </section>

          <section>
            <h3>Como funciona o compartilhamento com a doula</h3>
            <p>
              O compartilhamento usa <strong>Firebase Realtime Database</strong> apenas quando você toca em
              <strong> Iniciar compartilhamento</strong>.
            </p>
            <ul>
              <li>O app cria uma sessão temporária no banco.</li>
              <li>Sincroniza contrações, sinais de alerta e contexto da sessão.</li>
              <li>Gera um link de leitura para a doula acompanhar em tempo real.</li>
              <li>Sem compartilhamento ativo, nada da sessão vai para o banco.</li>
              <li>Ao encerrar, a sessão é fechada no banco.</li>
              <li>Ao resetar com sessão ativa, os dados locais e a sessão remota são removidos.</li>
            </ul>
            <p>
              No modo doula, a sessão é somente leitura. A doula acompanha o topo de decisão, alertas,
              métricas e contexto temporal sem interferir nos dados locais do aparelho principal.
            </p>
          </section>

          <section>
            <h3>Como funcionam os alertas</h3>
            <ul>
              <li>Notificação do navegador.</li>
              <li>Voz sintetizada.</li>
              <li>Som curto.</li>
              <li>Destaque visual na tela.</li>
            </ul>
            <p>
              Os alertas não disparam a cada atualização. Eles tentam avisar quando uma mudança relevante
              acontece pela primeira vez.
            </p>
          </section>

          <section>
            <h3>WhatsApp da doula</h3>
            <p>
              O botão <strong>Avisar doula no WhatsApp</strong> monta uma mensagem com o resumo recente e abre o
              WhatsApp com o texto pronto.
            </p>
            <ul>
              <li>Quantidade de contrações recentes.</li>
              <li>Duração média.</li>
              <li>Intervalo médio.</li>
              <li>Leitura do padrão.</li>
              <li>Conduta sugerida pelo app.</li>
            </ul>
            <p>O envio final depende da sua confirmação no WhatsApp.</p>
          </section>

          <section>
            <h3>Boas práticas durante o uso</h3>
            <ul>
              <li>Registrar as contrações no momento em que acontecem.</li>
              <li>Não pular registros se estiver acompanhando o padrão.</li>
              <li>Manter o mesmo critério de início e fim em todas as contrações.</li>
              <li>Usar notas curtas quando houver contexto relevante.</li>
              <li>Tratar sinais de alerta como prioridade clínica, não como detalhe.</li>
            </ul>
          </section>

          <section>
            <h3>Quando procurar ajuda sem esperar o app</h3>
            <p>
              Procurem orientação profissional imediatamente se houver preocupação importante, mesmo que o
              ritmo das contrações ainda não pareça avançado.
            </p>
            <ul>
              <li>Sangramento.</li>
              <li>Bolsa rota.</li>
              <li>Dor intensa e constante entre as contrações.</li>
              <li>Redução dos movimentos do bebê.</li>
              <li>Sensação de que algo não está bem.</li>
            </ul>
          </section>

          <section>
            <h3>Limites do app</h3>
            <p>
              Este app é um apoio de monitoramento. Ele ajuda a organizar informações, exibir tendência
              recente e compartilhar a sessão com a doula, mas não confirma estágio clínico do parto e
              não substitui avaliação profissional.
            </p>
          </section>

          <div className="manual-actions">
            <button className="button button-close button-close-bottom" onClick={onClose}>
              Fechar manual
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualModal




