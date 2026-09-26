# Processo de desenvolvimento — ESM Forum

## Board configurado

[Abrir o Kanban do ESM Forum no GitHub Projects](https://github.com/users/Matheus-Ludovico/projects/4/views/1).

O projeto é público, está vinculado aos dois repositórios e possui uma visualização Board agrupada pelo campo Status, com as cinco colunas descritas abaixo. Os cinco cards foram criados como itens de rascunho do Projects, com descrição completa, e estão no Backlog, ordenados de 1 a 5. A posição dos cards foi definida manualmente e o campo Prioridade registra essa ordem; ao repriorizar, atualizar tanto o campo quanto a posição no board.

## Escolha: Kanban

O desenvolvimento das cinco funcionalidades será gerenciado em um board Kanban no GitHub Projects, compartilhado entre os repositórios [backend](https://github.com/Matheus-Ludovico/esmforum) e [frontend](https://github.com/Matheus-Ludovico/esmforum-react).

Kanban torna visível o fluxo de trabalho, usa um sistema puxado (uma tarefa só começa quando há capacidade), limita o trabalho em andamento e promove entregas contínuas. A prioridade pode ser revista conforme o cliente aprende com as entregas, preservando o foco no que já está em execução.

O processo é adequado a um sistema didático pequeno, com cinco funcionalidades de tamanhos e dependências diferentes, sem equipe, velocidade ou calendário de sprints definidos. Busca e tags podem ser entregues cedo; perfil, votos e notificações exigem mais decisões sobre identidade e persistência. Kanban permite tratar essas diferenças sem comprometer um conjunto fixo de entregas por sprint.

Scrum também seria possível, mas exigiria definir papéis, objetivo e duração de sprint, planejamento e eventos recorrentes. Para o escopo atual, o fluxo contínuo e as políticas explícitas do Kanban oferecem organização com menor custo de coordenação.

## Colunas e políticas de movimentação

| Coluna | Significado e condição para sair |
| --- | --- |
| Backlog | Funcionalidades solicitadas, em ordem de prioridade. Saem quando critérios de aceite, dependências e abordagem mínima estão claros. |
| Pronto para desenvolver | Trabalho refinado, com dependências resolvidas, disponível para ser puxado. |
| Em desenvolvimento | Implementação de banco, API e interface, com testes pertinentes. Vai para revisão quando há PR e os critérios foram verificados pelo autor. |
| Em revisão e testes | Revisão de código e validação integrada de backend e frontend. Falhas voltam para desenvolvimento. |
| Concluído | Critérios de aceite atendidos, revisão realizada, testes aprovados, documentação atualizada e mudanças integradas. |

Limites iniciais de trabalho em andamento: **1 card em desenvolvimento** e **1 em revisão e testes**. São políticas da equipe; não há bloqueio automático configurado para impedi-las de serem excedidas. Ajustar os limites quando houver evidência de capacidade e gargalos. Concluir ou desbloquear trabalho existente antes de puxar o próximo card.

Um impedimento deve ser registrado no card com motivo, dependência e próxima ação, mantendo o card na etapa real do fluxo. Não marcar algo como concluído apenas porque uma parte (API ou interface) ficou pronta.

## Backlog priorizado

O campo numérico **Prioridade** usa valores de 1 a 5, sendo **1 a maior prioridade**. Os títulos também têm prefixos de ordem. A ordem representa a sequência inicial de entrega; não representa esforço ou prazo.

| Ordem | Funcionalidade | Motivo e dependências |
| --- | --- | --- |
| 1 | Busca de perguntas por palavra-chave | Benefício imediato para encontrar conteúdo e evitar perguntas repetidas; pode ser entregue sem identidade de usuário. |
| 2 | Categorização de perguntas por tags | Melhora a organização e complementa a busca; usar inicialmente tecnologia, carreira e dúvidas-gerais. |
| 3 | Perfil de usuário com histórico de perguntas e respostas | Viabiliza autoria real e histórico individual; estabelece a identidade usada por votos e notificações. |
| 4 | Votação em perguntas — upvote/downvote | Ajuda a destacar conteúdo útil; depende de identidade para controlar um voto por usuário/pergunta. |
| 5 | Notificação de novas respostas às suas perguntas | Fecha o ciclo de participação; depende de autoria de perguntas/respostas e identificação do destinatário do perfil. |

Os cinco cards começam em **Backlog**, pois esta entrega estrutura a gestão e não implementa as funcionalidades. Cada card cobre uma entrega completa nos dois repositórios e contém história de usuário, critérios de aceite, dependências e um checklist técnico inicial.

## Decisões de escopo para refinamento

- **Busca:** procurar uma palavra ou trecho no texto das perguntas, sem diferenciar maiúsculas/minúsculas; consulta vazia lista todas e nenhum resultado produz uma mensagem clara.
- **Tags:** aceitar uma ou mais tags do catálogo inicial por pergunta e filtrar por tag; o filtro deve funcionar junto com a busca. Perguntas antigas podem permanecer sem tag.
- **Perfil:** o código atual grava `id_usuario = 1` nas perguntas e não registra autor nas respostas. O card inclui identidade/autenticação mínima, vínculo de autoria e estratégia de migração; não se deve atribuir o histórico legado arbitrariamente a usuários novos.
- **Votos:** cada usuário identificado pode votar +1 ou -1 em cada pergunta, trocar ou retirar seu voto; o placar é a soma dos votos. A unicidade deve ser garantida no backend/banco.
- **Notificações:** proposta inicial de notificações dentro do sistema, com lista de não lidas, marcação como lida e link para a pergunta. E-mail, push e atualização em tempo real não fazem parte deste primeiro incremento. Confirmar essa decisão no refinamento com o cliente.

## Rotina e acompanhamento

Revisar o board a cada sessão de trabalho: atualizar os cards, verificar bloqueios e respeitar os limites. Rever a prioridade semanalmente ou quando chegar uma solicitação relevante do cliente. Demonstrar cada incremento concluído e usar o retorno para refinar os próximos cards.

Associar os PRs de backend e frontend ao respectivo card. Acompanhar tempo de ciclo (entrada em desenvolvimento até conclusão), quantidade de entregas e tempo bloqueado. Usar esses dados para ajustar o fluxo, sem inventar estimativas de velocidade antes de haver histórico.

## Critério de conclusão de uma funcionalidade

- Critérios de aceite do card atendidos na interface e na API.
- Alterações de banco preservam dados existentes e têm procedimento de migração documentado, quando aplicável.
- Testes proporcionais à mudança aprovados, incluindo validações e erros relevantes.
- Fluxo completo verificado com backend e frontend integrados.
- Código revisado e PRs integrados; documentação de uso/instalação atualizada quando necessário.

## Referência técnica

A configuração do projeto usa os campos, itens e visualizações documentados na [API oficial do GitHub Projects](https://docs.github.com/en/graphql/reference/projects).
