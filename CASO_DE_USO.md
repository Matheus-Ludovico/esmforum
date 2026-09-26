# Caso de Uso: Buscar perguntas por palavra-chave

**Identificador:** UC-01.

**História relacionada:** História 1 — Busca de perguntas por palavra-chave, de [HISTORIAS.md](HISTORIAS.md).

**Objetivo:** permitir que o visitante encontre discussões relevantes e evite publicar perguntas repetidas.

Este caso de uso especifica o comportamento esperado da funcionalidade planejada; não representa uma implementação já concluída.

## Atores

- **Ator principal:** visitante do fórum, autenticado ou não.

O sistema considerado é o ESM Forum completo. Interface React, API e banco de dados são componentes internos, não atores externos deste caso de uso.

## Pré-condições

- O visitante está na página de listagem de perguntas do ESM Forum.
- O campo de busca está disponível para interação.

Não é necessário estar autenticado nem haver perguntas cadastradas. A indisponibilidade da API é tratada como fluxo de exceção.

## Gatilho

O visitante decide procurar uma palavra ou um trecho no texto das perguntas.

## Fluxo principal

1. O sistema apresenta a listagem de perguntas e o campo de busca.
2. O visitante informa uma palavra ou um trecho no campo de busca.
3. O visitante aciona a busca.
4. O sistema apresenta um indicador de carregamento e encaminha a consulta à API.
5. O sistema verifica se a consulta está vazia ou contém apenas espaços; no fluxo principal, ela contém texto a pesquisar.
6. O sistema pesquisa perguntas cujo texto contenha a palavra ou o trecho informado, sem diferenciar maiúsculas de minúsculas e tratando os caracteres informados como texto. Se houver filtro por tag ativo, aplica também esse filtro.
7. O sistema obtém uma ou mais perguntas correspondentes e devolve o resultado à interface.
8. O sistema encerra o indicador de carregamento e substitui a listagem pelos resultados da busca, mantendo a consulta visível no campo.
9. O visitante consulta os resultados. O caso de uso termina com sucesso; uma nova pesquisa pode ser iniciada no passo 2.

## Fluxos alternativos

### FA-01 — Consulta vazia ou composta apenas por espaços

**Desvio:** passo 5 do fluxo principal.

1. O sistema identifica que não há texto a pesquisar.
2. O sistema obtém todas as perguntas, respeitando apenas o filtro por tag, caso esteja ativo.
3. Se houver perguntas, retorna ao passo 8 do fluxo principal e apresenta a listagem obtida.
4. Se não houver perguntas, segue o fluxo FA-02 a partir de seu passo 2.

### FA-02 — Nenhuma pergunta encontrada

**Desvio:** passo 7 do fluxo principal, ou passo 4 de FA-01.

1. O sistema obtém uma lista vazia para a consulta e os filtros aplicados.
2. O sistema encerra o indicador de carregamento, apresenta “Nenhuma pergunta encontrada” e mantém o campo de busca disponível.
3. O visitante pode alterar o texto, retornando ao passo 2 do fluxo principal, ou limpar a consulta, seguindo FA-03. Se não realizar outra ação, o caso de uso termina com resultado vazio, sem erro técnico.

### FA-03 — Limpar uma busca

**Desvio:** após a apresentação dos resultados no passo 8 do fluxo principal ou da mensagem no passo 2 de FA-02.

1. O visitante aciona a opção de limpar a busca.
2. O sistema esvazia o campo e inicia uma consulta sem filtro textual, exibindo o indicador de carregamento.
3. O sistema segue FA-01 a partir de seu passo 2, restaurando a listagem completa quando não houver filtro por tag ativo.

## Fluxo de exceção

### FE-01 — Falha de comunicação ou processamento da busca

**Desvio:** durante os passos 4 a 7 do fluxo principal, inclusive quando executados pelos fluxos alternativos.

1. O sistema identifica que a API não respondeu com sucesso ou que ocorreu uma falha ao processar a consulta.
2. O sistema encerra o indicador de carregamento e apresenta “Não foi possível buscar perguntas. Tente novamente.”, sem apresentar essa falha como “Nenhuma pergunta encontrada”.
3. O sistema mantém a consulta informada e oferece a opção de tentar novamente.
4. Se o visitante tentar novamente, retorna ao passo 4 do fluxo principal com a mesma consulta e os mesmos filtros. Se alterar o texto, retorna ao passo 2. Se abandonar a busca, o caso de uso termina sem obter um novo resultado.

## Pós-condições

### Em caso de sucesso

- A listagem apresenta somente perguntas que correspondem à consulta e aos demais filtros ativos, ou apresenta a mensagem de nenhum resultado quando não há correspondências.
- Uma consulta vazia ou a limpeza da busca apresenta todas as perguntas, sujeitas apenas a um eventual filtro por tag.
- O indicador de carregamento é encerrado, e o visitante pode iniciar outra busca.

### Em caso de falha

- A interface informa a falha, encerra o carregamento e permite repetir ou alterar a consulta, sem afirmar que não existem resultados.
- Nenhum novo resultado de busca é confirmado ao visitante.

### Garantia em todos os fluxos

- A busca é somente de leitura: não cria, altera nem exclui perguntas, respostas ou tags.
- Aspas e outros caracteres especiais são tratados como texto da consulta, sem executar comandos derivados da entrada do visitante.

## Regras de escopo

- A pesquisa considera o texto das perguntas; não inclui pesquisa no conteúdo das respostas.
- A ausência de autenticação não impede a busca.
- O filtro por tag só se aplica quando a funcionalidade de tags estiver disponível; ele não é pré-requisito para entregar esta história.
- Sugestões automáticas, correção ortográfica e busca semântica não fazem parte deste caso de uso.
