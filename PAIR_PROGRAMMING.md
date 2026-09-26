# Planejamento de pair programming — ESM Forum

## Natureza deste documento

Este é um **plano de aplicação caso eu tivesse um par**, e não um relato de sessões realizadas. Não houve sessão de pair programming nesta entrega. Não são atribuídos participantes, horas, resultados ou coautoria fictícios.

Aplicaria a prática trabalhando com outra pessoa, simultaneamente, no mesmo problema e no mesmo incremento. O objetivo seria compartilhar conhecimento do backend e frontend, discutir decisões pequenas e detectar erros durante a implementação.

## Ferramentas planejadas

| Ferramenta | Uso na sessão |
| --- | --- |
| VS Code + Live Share | Compartilhar o workspace para leitura e edição colaborativa, permitindo alternar quem escreve. |
| Discord | Chamada de voz e compartilhamento da janela do editor ou navegador para discutir o comportamento da interface. |
| Git e GitHub | Branches por funcionalidade, commits pequenos e PRs para registrar as mudanças e sua revisão. |
| GitHub Projects | Selecionar o card priorizado, acompanhar o estado, registrar impedimentos e vincular os PRs. |
| Jest, terminal e navegador | Executar testes pertinentes, iniciar API/interface e verificar o fluxo completo. |
| Temporizador | Lembrar a troca de papéis a cada 25 minutos. |

O Live Share permite compartilhar o projeto e encaminhar servidores e terminais; compartilharia apenas o necessário para a sessão. Usaria um terminal somente de leitura para acompanhar resultados quando a execução ficasse com o anfitrião. Fontes: [iniciar uma sessão](https://learn.microsoft.com/en-us/visualstudio/liveshare/quickstart/share) e [compartilhar servidores e terminais no VS Code](https://learn.microsoft.com/en-us/visualstudio/liveshare/use/share-server-visual-studio-code).

O anfitrião abriria as pastas dos dois repositórios no workspace e iniciaria backend e frontend conforme `INSTALACAO.md`. Como o React chama `http://localhost:5000`, compartilhar somente a porta 3000 não basta para o convidado usar a aplicação em seu navegador: também seria necessário disponibilizar a API na porta 5000 e verificar os endereços encaminhados. Como alternativa, ambos observariam o navegador do anfitrião pelo compartilhamento de tela.

Se o Live Share não estivesse disponível, usaríamos compartilhamento de tela com voz; na troca de driver, faríamos um commit do incremento, sincronizaríamos a mesma branch e trocaríamos o compartilhamento. Não editaríamos cópias divergentes simultaneamente. Presencialmente, usaríamos uma estação e alternaríamos teclado e mouse.

## Papéis e rotação

| Papel | Responsabilidade |
| --- | --- |
| Driver | Escrever código e testes, executar comandos e explicar o raciocínio enquanto implementa o próximo passo acordado. |
| Navigator | Acompanhar ativamente, verificar critérios de aceite, pensar em casos de erro, observar contratos entre API e interface e questionar complexidade desnecessária. |

Trocaríamos os papéis **a cada 25 minutos**, preferencialmente ao concluir um pequeno passo. O driver resumiria o estado e a próxima ação; o navigator assumiria a edição. Também alternaríamos quem inicia como driver entre sessões. Ser anfitrião do Live Share não significaria permanecer como driver.

O navigator não ficaria passivo nem desenvolveria outra funcionalidade em paralelo. Ambos passariam por banco, API, testes e interface, evitando uma divisão permanente em “pessoa do backend” e “pessoa do frontend”. Dúvidas seriam discutidas com exemplos e testes; decisões sem consenso seriam registradas para refinamento.

## Roteiro de uma sessão de aproximadamente 70 minutos

1. **10 minutos — preparação conjunta:** escolher o card mais prioritário que esteja pronto, conferir dependências e definir um objetivo pequeno e verificável. Sincronizar os repositórios, abrir uma branch da funcionalidade em cada repositório afetado e conferir o ambiente.
2. **25 minutos — primeiro ciclo:** pessoa A como driver e pessoa B como navigator. Formular um caso de teste, observar a falha esperada e implementar o mínimo para atendê-lo, quando esse ciclo for apropriado à mudança.
3. **5 minutos — pausa e passagem:** resumir decisões, dúvidas e testes pendentes; trocar papéis.
4. **25 minutos — segundo ciclo:** pessoa B como driver e pessoa A como navigator. Cobrir o próximo comportamento, verificar o incremento integrado e refatorar apenas com os testes relevantes passando.
5. **5 minutos — fechamento:** revisar o diff, registrar o que foi validado, fazer commit e atualizar o card com progresso, bloqueios e próximo passo. Abrir ou atualizar PR quando houver um incremento revisável.

O temporizador não obrigaria a abandonar uma operação no meio; concluiríamos o passo seguro e trocaríamos em seguida. Uma funcionalidade poderia exigir várias sessões.

## Aplicação às cinco funcionalidades

Seguiríamos a prioridade do [board Kanban](https://github.com/users/Matheus-Ludovico/projects/4/views/1), respeitando dependências e os limites de trabalho em andamento de `PROCESSO.md`.

| Ordem e funcionalidade | Foco do trabalho em dupla | Exemplos de verificação conjunta |
| --- | --- | --- |
| 1. Busca por palavra-chave | Acordar o parâmetro de consulta, implementar SQL parametrizado e conectar o campo de busca à listagem. | Consulta vazia, palavra encontrada, ausência de resultado, maiúsculas/minúsculas e caracteres especiais. |
| 2. Tags | Modelar associação pergunta–tag, preservar dados existentes e combinar seleção, exibição e filtro na interface. | Várias tags, tag inválida, pergunta antiga sem tag e filtro combinado com busca. |
| 3. Perfil e histórico | Refinar identidade/autenticação, substituir a autoria fixa das perguntas e registrar o autor das respostas. | Históricos de dois usuários, lista vazia, tentativa de falsificar autoria e migração de dados legados. |
| 4. Votação | Implementar unicidade por usuário/pergunta e os controles de upvote/downvote. | Voto repetido, troca, retirada, dois usuários e tentativa sem autenticação. |
| 5. Notificações | Refinar notificações dentro da aplicação, definir destinatário e acompanhar resposta, leitura e navegação. | Resposta de outra pessoa, resposta própria, duplicidade e tentativa de consultar notificações alheias. |

Daríamos atenção especial em dupla à migração de autoria, à unicidade dos votos e à autorização das notificações. Não iniciaríamos votos ou notificações antes de resolver a identidade necessária no perfil.

## Exemplo hipotético: primeiro incremento de busca

Escolheríamos o critério “buscar uma palavra retorna somente as perguntas correspondentes”. Com A no teclado, definiríamos um teste do modelo com perguntas que correspondem ou não à consulta. B observaria se o SQL permanece parametrizado e se a listagem sem consulta preserva seu comportamento.

Após a troca, B implementaria o tratamento da consulta na rota e sua utilização no frontend; A verificaria estados de carregamento, resultado vazio e limpeza da busca. Juntos testaríamos o fluxo no navegador, executaríamos os testes afetados e revisaríamos o diff. Não adicionaríamos sugestões automáticas, busca semântica ou um serviço externo de pesquisa sem um requisito concreto.

## Integração, revisão e registro

Os dois trabalhariam no mesmo card; isso conta como **um item em desenvolvimento**, de acordo com o Kanban. Ao concluir a implementação e as verificações do autor, o card iria para “Em revisão e testes”. Só passaria a “Concluído” após cumprir os critérios definidos em `PROCESSO.md`.

O PR registraria as decisões e os testes realmente executados. A revisão contínua durante o pareamento não dispensaria conferir o diff final e os resultados de integração. Se houvesse outra pessoa disponível, solicitaríamos revisão adicional; com apenas a dupla, faríamos uma revisão final conjunta explicitamente registrada.

Modelo de registro a preencher **somente após uma sessão real**:

```text
Data e duração:
Participantes:
Card e objetivo do incremento:
Driver/navigator no primeiro e no segundo ciclo:
Decisões tomadas:
Testes/verificações executados e resultados:
Commits/PRs:
Impedimentos e próximo passo:
Melhoria para a próxima sessão:
```

Caso eu continuasse trabalhando sozinho, aplicaria testes, revisão do próprio diff e documentação, mas registraria esse trabalho como individual. Não apresentaria revisão individual ou uso de assistente de código como evidência de uma sessão humana de pair programming que não ocorreu.
