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
              O Monitor de Contrações ajuda a registrar contrações, observar o padrão ao longo do
              tempo e apoiar decisões práticas durante o trabalho de parto. Ele foi pensado para
              uso simples pelo acompanhante, especialmente pelo pai, sem precisar fazer contas ou
              anotações manuais.
            </p>
            <p>
              O app <strong>não faz diagnóstico médico</strong> e <strong>não substitui</strong>{' '}
              orientação da doula, da equipe obstétrica ou do hospital.
            </p>
          </section>

          <section>
            <h3>Antes de começar</h3>
            <ul>
              <li>Se quiser usar como app, instale na tela inicial do celular antes do uso real.</li>
              <li>Confirme se o número da doula está correto no campo de WhatsApp.</li>
              <li>Ative os alertas se quiser receber aviso por notificação, voz e som.</li>
              <li>Deixe o celular carregado e por perto.</li>
              <li>Combine um critério simples para marcar início e fim da contração.</li>
              <li>
                Se a doula for acompanhar à distância, toque em <strong>Iniciar compartilhamento</strong>{' '}
                antes de começar. A sessão só vai para o banco quando o compartilhamento estiver ativo.
              </li>
              <li>
                Ao iniciar o compartilhamento, o app cria a sessão no banco e sincroniza os dados já
                salvos neste aparelho.
              </li>
              <li>
                Se o modo doula mostrar <strong>Ao vivo</strong>, as atualizações estão chegando quase
                na hora. Se mostrar <strong>Atualização automática</strong>, o app continua tentando
                atualizar em alguns segundos.
              </li>
              <li>
                <strong>Resetar dados</strong> apaga os dados deste aparelho e, se houver sessão
                compartilhada ativa, também remove os registros dessa sessão no banco.
              </li>
            </ul>
          </section>

          <section>
            <h3>Como registrar</h3>
            <ul>
              <li>
                Toque em <strong>Iniciar contração</strong> quando ela começar.
              </li>
              <li>
                Toque em <strong>Encerrar contração</strong> quando ela terminar.
              </li>
              <li>Repita isso a cada contração, sempre com o mesmo critério.</li>
              <li>O app salva automaticamente horário de início, fim e duração.</li>
              <li>
                O mais importante é registrar no momento em que acontece, sem tentar reconstruir
                depois.
              </li>
            </ul>
          </section>

          <section>
            <h3>Como marcar conforto e dor</h3>
            <p>
              Durante a contração em andamento, escolha como ela está naquele momento. Esse módulo
              complementa a leitura do tempo, mas não substitui a análise principal.
            </p>
            <ul>
              <li>
                <strong>Bem</strong>: ela está lidando bem com a contração.
              </li>
              <li>
                <strong>Mais desconfortável</strong>: está mais difícil, exigindo mais atenção e
                apoio.
              </li>
              <li>
                <strong>Muita dor</strong>: dor intensa ou sofrimento importante durante as
                contrações recentes.
              </li>
            </ul>
            <p>
              O app usa esse sinal como apoio para deixar as recomendações mais cautelosas quando
              necessário.
            </p>
          </section>

          <section>
            <h3>O que o app calcula automaticamente</h3>
            <ul>
              <li>Duração de cada contração.</li>
              <li>Intervalo entre os inícios das contrações.</li>
              <li>Duração média das contrações recentes.</li>
              <li>Intervalo médio das contrações recentes.</li>
              <li>Fase provável com base no padrão das últimas contrações.</li>
              <li>Recomendação prática do momento.</li>
            </ul>
            <p>
              A análise principal usa uma janela móvel das contrações mais recentes para refletir o
              momento atual, e não o histórico inteiro.
            </p>
          </section>

          <section>
            <h3>Como ler a tela</h3>
            <ul>
              <li>
                <strong>Contração atual</strong>: mostra o cronômetro em tempo real da contração em
                andamento.
              </li>
              <li>
                <strong>Métricas</strong>: mostra duração média, intervalo médio e últimos dados.
              </li>
              <li>
                <strong>Fase provável</strong>: mostra em que faixa o padrão atual parece estar.
              </li>
              <li>
                <strong>Recomendação</strong>: mostra a ação prática sugerida naquele momento.
              </li>
              <li>
                <strong>Timeline</strong>: mostra visualmente se os intervalos estão encurtando.
              </li>
              <li>
                <strong>Histórico</strong>: lista cada contração já registrada.
              </li>
            </ul>
          </section>

          <section>
            <h3>Como interpretar as fases</h3>
            <ul>
              <li>
                <strong>Pródromos / início</strong>: contrações mais espaçadas ou padrão ainda pouco
                consistente. Em geral, a orientação é continuar em casa, descansar, comer e se
                hidratar.
              </li>
              <li>
                <strong>Fase latente</strong>: contrações mais frequentes, muitas vezes se
                aproximando da faixa de 7 a 5 minutos. O app passa a sugerir avisar a doula.
              </li>
              <li>
                <strong>Fase ativa</strong>: contrações mais próximas, em geral por volta de 4 a 3
                minutos, com boa duração. O app sugere preparar ida ao hospital.
              </li>
              <li>
                <strong>Transição</strong>: intervalos muito curtos, abaixo de 3 minutos. O app
                indica urgência e sugere procurar atendimento imediatamente.
              </li>
            </ul>
            <p>
              <strong>Expulsivo</strong> e <strong>Placenta</strong> aparecem apenas como referência
              visual no timeline. O app não faz automação clínica para essas fases.
            </p>
          </section>

          <section>
            <h3>Sinais de alerta importantes</h3>
            <p>
              O card <strong>Sinais de alerta</strong> existe para registrar situações que podem
              exigir ação rápida, mesmo quando o padrão das contrações ainda não parece avançado.
            </p>
            <ul>
              <li>
                <strong>Perdeu o tampão</strong>: sozinho, normalmente não exige ir direto ao
                hospital.
              </li>
              <li>
                <strong>Bolsa rompeu</strong>: entrar em contato com a maternidade ou equipe.
              </li>
              <li>
                <strong>Líquido verde ou marrom</strong>: pode sugerir mecônio e exige avaliação
                rápida.
              </li>
              <li>
                <strong>Menos movimentos do bebê</strong>: procurar orientação imediatamente.
              </li>
              <li>
                <strong>Sangramento</strong>: procurar avaliação.
              </li>
              <li>
                <strong>Cheiro ruim ou febre</strong>: procurar avaliação.
              </li>
              <li>
                <strong>Menos de 37 semanas</strong>: ajuda o app a tratar bolsa rota ou tampão com
                mais cautela.
              </li>
            </ul>
          </section>

          <section>
            <h3>Como funcionam os alertas</h3>
            <p>
              Quando os alertas estão ativados, o app pode avisar quando o padrão muda para um
              ponto importante.
            </p>
            <ul>
              <li>Notificação do navegador.</li>
              <li>Voz sintetizada.</li>
              <li>Som curto.</li>
              <li>Destaque visual na tela.</li>
            </ul>
            <p>
              Os alertas não disparam a cada atualização da tela. Eles são controlados para avisar
              apenas quando uma fase importante é alcançada pela primeira vez.
            </p>
          </section>

          <section>
            <h3>Como funciona o WhatsApp da doula</h3>
            <p>
              O botão <strong>Avisar doula no WhatsApp</strong> monta uma mensagem automática com os
              dados recentes e abre o WhatsApp com o texto pronto.
            </p>
            <ul>
              <li>Quantidade de contrações recentes.</li>
              <li>Duração média.</li>
              <li>Intervalo médio.</li>
              <li>Fase provável.</li>
              <li>Recomendação atual do app.</li>
            </ul>
            <p>
              O envio final depende da sua confirmação no WhatsApp. O app não envia mensagens em
              segundo plano sozinho.
            </p>
          </section>

          <section>
            <h3>Boas práticas durante o uso</h3>
            <ul>
              <li>Registrar as contrações no momento em que acontecem.</li>
              <li>Não pular registros se estiverem acompanhando o padrão.</li>
              <li>Manter o mesmo critério de início e fim em todas as contrações.</li>
              <li>Comer, se hidratar e descansar no começo.</li>
              <li>Não avisar a família logo no início, se ainda parecer muito cedo.</li>
              <li>Usar a marcação de conforto para complementar a leitura do momento.</li>
            </ul>
          </section>

          <section>
            <h3>Quando procurar ajuda sem esperar o app</h3>
            <p>
              Procurem orientação profissional imediatamente se houver preocupação importante, mesmo
              que o padrão das contrações ainda não pareça avançado.
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
              Este app é um apoio de monitoramento. Ele ajuda a organizar informações e mostrar um
              padrão provável, mas não confirma estágio clínico do parto e não substitui avaliação
              profissional.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ManualModal
