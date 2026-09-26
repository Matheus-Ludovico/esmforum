# Design simples no backend do ESM Forum

## Escopo da análise

Análise do backend no commit `ca0b80e819bcf462d7d55088bad455fbcc7a76b8`, anterior a esta documentação. Foram examinados `server.js`, `modelo.js`, `bd/bd_utils.js`, `bd/schema.sql`, `package.json` e os testes existentes.

**Nesta versão não existem `routes/perguntas.js` nem `routes/respostas.js`.** As rotas correspondentes estão em [server.js](server.js), e as operações de perguntas e respostas estão em [modelo.js](modelo.js). A análise usa esses arquivos reais, sem supor uma estrutura diferente da disponível.

Este documento apresenta uma avaliação e propostas: os exemplos identificados como sugestões **não foram aplicados ao código de produção** nesta tarefa.

## O que significa design simples

Em XP, buscamos um desenho que atenda aos requisitos atuais, seja compreensível, evite duplicação desnecessária e tenha apenas os elementos necessários. Testes dão suporte para simplificar sem quebrar comportamentos. Menos linhas, isoladamente, não significam melhor design.

YAGNI (*You Aren't Gonna Need It*, ou “você não vai precisar disso”) orienta a não implementar recursos ou abstrações apenas por imaginar que poderão ser úteis. Isso não elimina validação, correção ou requisitos já solicitados. As cinco funcionalidades do backlog são demandas reais; sua implementação deve ocorrer incrementalmente, quando cada card for desenvolvido.

## Aspectos que já favorecem a simplicidade

### 1. Rotas pequenas e responsabilidade bem delimitada

Trecho atual de `server.js`:

```js
app.post('/perguntas', (req, res) => {
  try {
    const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
    res.json({id_pergunta: id_pergunta});
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

A rota lê o corpo HTTP, chama uma operação do modelo e devolve o resultado. O SQL fica fora da rota. Não há classes de controlador, serviços genéricos ou uma hierarquia de repositórios sem necessidade demonstrada. Para quatro rotas, essa divisão é fácil de acompanhar.

O `POST /respostas` segue o mesmo desenho, recebendo `id_pergunta` e `resposta` e chamando `modelo.cadastrar_resposta`. Os endpoints são explícitos; não é necessário criar uma fábrica genérica de CRUD para economizar poucas linhas.

### 2. Funções com intenção clara e SQL direto

Trechos atuais de `modelo.js`:

```js
function get_pergunta(id_pergunta) {
  return bd.query('select * from perguntas where id_pergunta = ?', [id_pergunta]);
}

function get_respostas(id_pergunta) {
  return bd.queryAll('select * from respostas where id_pergunta = ?', [id_pergunta]);
}
```

Cada função faz uma consulta específica, com parâmetros separados do SQL. Isso mantém visíveis as operações necessárias e evita concatenar a entrada do usuário na consulta. Um ORM ou suporte a vários bancos aumentaria o número de conceitos sem atender a um requisito atual.

### 3. Persistência pequena, adequada ao contexto didático

Trecho atual de `bd/bd_utils.js`:

```js
const Database = require('better-sqlite3');

var bd = new Database('./bd/esmforum.db');

function query(query, params) {
  return bd.prepare(query).get(params);
}
```

O banco está em um arquivo e o acesso é síncrono. Isso reduz a configuração e dispensa promessas em torno de operações que já são síncronas. Não há justificativa, nesta tarefa, para introduzir microsserviços, filas, cache distribuído ou outra infraestrutura. Esse julgamento é contextual: consultas síncronas podem se tornar uma limitação se a carga crescer.

### 4. Testabilidade sem infraestrutura elaborada

Trecho atual de `modelo.js`:

```js
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}
```

`testes/listar_perguntas.test.js` usa essa função para fornecer um objeto com funções simuladas pelo Jest. `testes/modelo.test.js` exercita a persistência em um banco de teste. Há uma forma simples de testar o modelo sem um contêiner de injeção de dependências.

A troca de uma variável de módulo exige cuidado com isolamento dos testes; isso não torna necessário substituir tudo por uma arquitetura maior. Os testes existentes tampouco comprovam validação HTTP ou todas as regras de integridade.

## Oportunidades de simplificação e correção

### 1. Incluir as consultas no tratamento de erros da rota de respostas

Trecho atual de `server.js`:

```js
app.get('/respostas/:id_pergunta', (req, res) => {
  const id_pergunta = req.params.id_pergunta;
  const pergunta = modelo.get_pergunta(id_pergunta);
  const respostas = modelo.get_respostas(id_pergunta);
  try {
    res.json({
      pergunta: pergunta,
      respostas: respostas
    });
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});
```

As consultas que podem falhar estão fora do `try`. Assim, esse `catch` não trata seus erros; uma exceção síncrona seguirá para o tratamento de erros do Express. A sugestão mínima é colocar toda a operação no mesmo bloco, mantendo o formato de sucesso:

```js
app.get('/respostas/:id_pergunta', (req, res) => {
  try {
    const id_pergunta = req.params.id_pergunta;
    const pergunta = modelo.get_pergunta(id_pergunta);
    const respostas = modelo.get_respostas(id_pergunta);
    res.json({ pergunta, respostas });
  } catch (erro) {
    res.status(500).json(erro.message);
  }
});
```

Essa proposta reorganiza o fluxo sem criar camadas. Manter `erro.message` no exemplo preserva o tratamento atual; uma política de resposta pública e registro interno dos erros seria uma decisão separada. Validar a proposta com erro simulado nas consultas e uma resposta de sucesso.

### 2. Remover `RETURNING` redundante nos cadastros

Hoje `cadastrar_pergunta` e `cadastrar_resposta` usam `INSERT ... RETURNING`, mas `bd.exec` chama `.run(params)`, e o modelo usa `result.lastInsertRowid`, em vez de ler a linha devolvida por `RETURNING`.

Exemplo atual de `modelo.js`:

```js
function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}
```

Sugestão equivalente para a obtenção do identificador:

```js
function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec(
    'INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?)',
    params
  );
  return result.lastInsertRowid;
}
```

A mesma alteração pode ser aplicada ao `INSERT` de respostas. O SQL passa a expressar apenas a operação utilizada. Antes de integrar, verificar inserção e ID retornado para perguntas e respostas; os testes atuais de cadastro de perguntas ajudam, mas não cobrem todo esse contrato.

### 3. Avaliar uma dependência de banco sem uso no código da aplicação

`package.json` declara `better-sqlite3` e `sqlite3`, mas o código JavaScript analisado importa somente `better-sqlite3`. Remover a dependência npm `sqlite3`, após confirmar seu desuso nos scripts e no processo de instalação, reduziria manutenção e instalação de módulos nativos.

O comando `sqlite3` usado por `bd/criar_bd.sh` é uma ferramenta de linha de comando do sistema, não a dependência npm de mesmo nome. São coisas diferentes. Uma eventual remoção deve atualizar `package.json` e `package-lock.json`, seguida de instalação limpa, testes e inicialização do backend. Nenhuma dependência foi removida nesta entrega.

### 4. Tratar duplicação de erros de forma proporcional

As quatro rotas repetem `try/catch` com a mesma resposta de erro. Essa duplicação ainda é pequena e legível. Se novas rotas exigirem a mesma política, pode-se centralizá-la em um middleware de erros do Express, encaminhando erros com `next(erro)` e posicionando o middleware depois das rotas.

Não é necessário introduzir agora um framework de tratamento de erros ou um executor genérico de rotas. A decisão deve considerar a repetição real e os testes do contrato HTTP, e não apenas a contagem de linhas.

## Limitações que não devem ser confundidas com YAGNI

| Evidência no código | Avaliação |
| --- | --- |
| `id_usuario` é sempre `1` no cadastro da pergunta; respostas não têm autor no schema. | Simplificação do exemplo original, mas insuficiente para o perfil, os votos individuais e as notificações solicitados. Implementar identidade e autoria no card de perfil. |
| Rotas de cadastro passam o corpo diretamente ao modelo. | Falta de validação não é virtude de design simples. Verificar texto, identificador e existência da pergunta exige regras explícitas. Respostas 400/404 seriam mudanças de contrato, com testes próprios. |
| `respostas.id_pergunta` não declara chave estrangeira no schema. | A integridade de respostas precisa ser considerada; uma referência a pergunta inexistente não deve ser aceita apenas para manter o código curto. |
| `listar_perguntas` consulta todas as perguntas e executa uma contagem por pergunta. | São 1 + N consultas. É fácil de entender no exemplo pequeno. Uma agregação SQL pode reduzir consultas, mas deve ser motivada por necessidade observada, mantendo perguntas sem respostas e o mesmo formato de saída. |

Separar as rotas em `routes/perguntas.js` e `routes/respostas.js` pode melhorar a navegação quando o backend crescer. Não é necessário criar esses arquivos apenas porque são citados no enunciado. Se a extração ocorrer, deve preservar caminhos e respostas consumidos pelo frontend.

## Aplicação às próximas funcionalidades

Entregar primeiro uma busca textual no SQLite e tags do catálogo definido, sem adotar antecipadamente um motor de busca externo. Implementar identidade suficiente para autoria antes de votos e notificações. Na votação, atender às regras de voto único, troca e retirada, sem adicionar reputação ou gamificação não solicitadas. Para notificações, refinar com o cliente o incremento dentro da aplicação antes de acrescentar e-mail, push ou infraestrutura de tempo real.

A prioridade é manter comportamento correto e compreensível. As simplificações propostas devem ser pequenas, verificáveis e separadas das novas funcionalidades para facilitar revisão e diagnóstico de regressões.

## Verificação dos exemplos desta documentação

Os oito blocos JavaScript passaram por verificação de sintaxe com `node --check`. As inserções de perguntas e respostas com e sem `RETURNING` foram exercitadas com `better-sqlite3` em um banco em memória usando o schema do projeto; em ambos os casos, `lastInsertRowid` identificou o registro inserido. Essa verificação não substitui testes de rotas nem significa que as refatorações foram implementadas. O banco da aplicação não foi alterado.
