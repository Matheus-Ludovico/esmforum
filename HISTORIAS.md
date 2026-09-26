# Histórias de usuário — ESM Forum

Foram escolhidas três das cinco funcionalidades solicitadas: busca de perguntas, categorização por tags e perfil com histórico. As histórias seguem as prioridades 1, 2 e 3 do [Kanban do projeto](https://github.com/users/Matheus-Ludovico/projects/4/views/1), conforme [PROCESSO.md](PROCESSO.md). O número 1 representa a maior prioridade.

Os critérios abaixo definem o comportamento esperado para a conclusão de cada história. As caixas permanecem desmarcadas porque este documento especifica funcionalidades ainda no Backlog.

## História 1: Busca de perguntas por palavra-chave

**Prioridade no Kanban: 1.**

Como visitante do fórum, eu quero buscar perguntas por palavra-chave para encontrar discussões relevantes e evitar publicar perguntas repetidas.

### Critérios de aceitação

- [ ] A listagem apresenta um campo de busca que, ao ser enviado, retorna somente perguntas cujo texto contenha a palavra ou o trecho informado, sem diferenciar maiúsculas de minúsculas.
- [ ] Uma consulta vazia ou composta apenas por espaços retorna todas as perguntas; limpar uma busca também restaura a listagem completa quando não há outro filtro ativo.
- [ ] Quando nenhuma pergunta corresponde à consulta, a interface informa “Nenhuma pergunta encontrada” e permite alterar ou limpar a busca.
- [ ] Consultas com aspas ou outros caracteres especiais são tratadas como texto, sem erro de SQL nem alteração dos dados armazenados.
- [ ] Durante a consulta, a interface indica carregamento; se a API falhar, apresenta uma mensagem de erro, distinta do estado de nenhum resultado, e permite tentar novamente.

## História 2: Categorização de perguntas por tags

**Prioridade no Kanban: 2.**

Como participante do fórum, eu quero associar tags às perguntas e filtrar a listagem por assunto para organizar o conteúdo e encontrar discussões de meu interesse.

### Critérios de aceitação

- [ ] Ao criar uma pergunta, o participante pode selecionar uma ou mais tags do catálogo inicial: `tecnologia`, `carreira` e `dúvidas-gerais`; as associações são preservadas após recarregar a página.
- [ ] As tags associadas aparecem na listagem e no detalhe da pergunta, sem repetições; a API rejeita tags que não pertençam ao catálogo.
- [ ] Ao selecionar uma tag no filtro, a listagem exibe somente perguntas associadas a ela; remover o filtro restaura os resultados sujeitos apenas à busca textual, se houver.
- [ ] Com busca textual e filtro por tag ativos, a listagem retorna somente perguntas que atendam às duas condições; se nenhuma atender, exibe a mensagem de nenhum resultado.
- [ ] A inclusão das tags preserva as perguntas e respostas existentes; perguntas antigas sem tag continuam acessíveis na listagem sem filtro por tag e em seus detalhes.

## História 3: Perfil de usuário com histórico de perguntas e respostas

**Prioridade no Kanban: 3.**

Como usuário do fórum, eu quero acessar meu perfil com o histórico das minhas perguntas e respostas para acompanhar minhas contribuições e retomar as discussões de que participei.

### Critérios de aceitação

- [ ] O participante consegue criar uma conta com identificador persistente e nome de exibição, entrar e sair da sessão; ao entrar, consegue acessar seu perfil, que exibe seu nome de exibição.
- [ ] Novas perguntas e respostas são vinculadas pelo servidor ao usuário autenticado e mantêm essa autoria após nova sessão; tentativas de criação sem autenticação ou de atribuição a outro usuário são rejeitadas.
- [ ] O perfil apresenta listas separadas de perguntas e respostas do usuário, com texto que identifique cada contribuição e links para a discussão correspondente; ao consultar os históricos de dois usuários, cada histórico contém somente as contribuições do respectivo autor.
- [ ] Quando o usuário não possui perguntas ou respostas, a respectiva lista apresenta uma mensagem de histórico vazio; o perfil e suas respostas de API não expõem senhas, hashes de senha ou tokens de sessão.
- [ ] A migração preserva as perguntas e respostas antigas e identifica a autoria não comprovada como legada ou desconhecida, sem associar automaticamente esse conteúdo a uma conta nova.

**Dependência de escopo:** a versão atual fixa `id_usuario = 1` nas perguntas e não registra o autor das respostas. Por isso, esta história inclui a identidade/autenticação mínima e o vínculo de autoria necessários ao histórico. O mecanismo de autenticação e a política de acesso a perfis de terceiros devem ser definidos no refinamento antes de iniciar o desenvolvimento.

## Justificativa da priorização

| Ordem | História | Justificativa |
| --- | --- | --- |
| 1 | Busca por palavra-chave | Entrega benefício imediato para localizar conteúdo e evitar duplicações. Pode ser desenvolvida sem depender de contas ou autoria, oferecendo um primeiro incremento de escopo menor. |
| 2 | Categorização por tags | Complementa a busca com organização por assunto. Vem depois para integrar o filtro por tag ao mecanismo de consulta já entregue, mantendo a navegação consistente. |
| 3 | Perfil com histórico | Exige mais mudanças estruturais: identidade, autoria de respostas e migração dos dados existentes. Vem após os dois incrementos de navegação e prepara a base necessária às próximas funcionalidades de votação e notificações. |

A ordem conserva a prioridade já definida no Kanban e equilibra valor imediato, tamanho da mudança e dependências. Perfil não depende tecnicamente de busca ou tags; sua posição é uma escolha de entrega incremental. Votação e notificações permanecem no backlog geral, nas posições 4 e 5, e não fazem parte das três histórias desta entrega.
