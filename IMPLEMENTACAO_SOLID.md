# Implementação SOLID — Busca de perguntas

## Funcionalidade implementada

Implementação da História 1 e do UC-01: buscar por palavra ou trecho no texto das perguntas. `GET /?q=texto` retorna um array com `id_pergunta`, `texto`, `id_usuario` e `num_respostas`. Sem `q`, com texto vazio ou somente espaços, retorna todas as perguntas. A pesquisa ignora diferenças de maiúsculas/minúsculas (incluindo letras acentuadas), preserva acentos e interpreta aspas, `%` e `_` literalmente. Consulta estruturada, como `q[]=x`, recebe HTTP 400; falhas de processamento recebem 500.

A interface oferece campo rotulado, Buscar, Limpar, carregamento, mensagem “Nenhuma pergunta encontrada” e mensagem de falha com “Tentar novamente”. A repetição usa a última consulta aplicada. Um contador de requisições impede respostas antigas de sobrescreverem resultados recentes. Após cadastrar pergunta, a lista é consultada novamente respeitando a busca ativa. A busca é somente leitura. Tags não foram implementadas, conforme a regra de escopo do caso de uso.

Os caminhos de backend abaixo são relativos a `esmforum`; os de frontend, a `esmforum-react`.

## SRP — Responsabilidade única

- `servicos/buscar_perguntas.js`: valida e normaliza a consulta e aplica a regra de correspondência textual.
- `repositorios/perguntas_sqlite.js`: consulta perguntas e conta respostas em uma única consulta SQL.
- `app.js`: adapta HTTP, configura Express e CORS e retorna a aplicação sem abrir porta.
- `server.js`: compõe as dependências concretas e inicia o servidor.
- `src/servicos/perguntas.js`: transporte HTTP da busca.
- `src/pages/Pergunta.js`: interação e estados visuais.

Exemplo do adaptador de persistência:

```js
function criarRepositorioPerguntas(conexao) {
  return {
    listar() {
      return conexao.queryAll(`
        SELECT p.*, COUNT(r.id_resposta) AS num_respostas
        FROM perguntas p
        LEFT JOIN respostas r ON r.id_pergunta = p.id_pergunta
        GROUP BY p.id_pergunta
        ORDER BY p.id_pergunta
      `, []);
    }
  };
}
```

## DIP — Inversão de dependência

O serviço depende do contrato síncrono `listar() -> Array<PerguntaComContagem>`, documentado em seu módulo. Não importa SQLite, Express nem o modelo legado. A implementação concreta é fornecida no ponto de composição:

```js
const buscarPerguntas = criarBuscaPerguntas(criarRepositorioPerguntas(bd));
const app = criarApp(modelo, buscarPerguntas);
```

A aplicação recebe a operação de busca; a página recebe `buscar(consulta) -> Promise<Array>` por propriedade, com o cliente HTTP como implementação padrão. Em JavaScript, esses contratos são expressos por funções, documentação e testes, sem necessidade de classes abstratas.

## OCP — Aberto para extensão, fechado para modificação

Uma nova fonte de dados pode implementar `listar()` e ser conectada em `server.js`, sem alterar o serviço ou a rota. Os testes já exercitam essa extensão com uma implementação em memória:

```js
const buscar = criarBusca({ listar: () => perguntas });
```

O algoritmo permanece igual para ambos os adaptadores:

```js
function criarBuscaPerguntas(repositorio) {
  return function buscarPerguntas(consulta = '') {
    if (typeof consulta !== 'string') {
      throw new TypeError('A consulta deve ser um texto.');
    }
    const termo = consulta.trim().toLocaleLowerCase('pt-BR');
    return repositorio.listar().filter(pergunta =>
      pergunta.texto.toLocaleLowerCase('pt-BR').includes(termo));
  };
}
```

O ponto de extensão é a fonte de dados, não qualquer mudança futura nas regras de busca. Novos contratos assíncronos ou paginação exigiriam evolução explícita do desenho.

## LSP e ISP — Aplicação proporcional

**LSP:** o adaptador SQLite e o colaborador em memória respeitam o mesmo retorno síncrono, com texto e contagem de respostas. Não há hierarquia de herança; a substituição é estrutural. Os testes verificam a busca com os dois colaboradores, sem afirmar compatibilidade com implementações arbitrárias.

**ISP:** o serviço exige somente `listar()`, sem obrigar seu colaborador a implementar cadastro, exclusão ou operações SQL. A interface de busca da página também exige somente uma função assíncrona.

## Validação e execução

Com as dependências instaladas:

```sh
cd esmforum
npm test -- --runInBand
node server.js
```

Em outro terminal:

```sh
cd esmforum-react
CI=true npm test -- --watchAll=false --runInBand
npm run build
npm start
```

Resultados verificados: 14 testes de backend aprovados (incluindo os legados), 1 teste de interface aprovado e build de produção concluído. Os testes cobrem consulta vazia, trecho, acentos/maiúsculas, caracteres literais, ausência de resultado, entrada inválida, isolamento de instâncias, SQLite em memória com contagens e HTTP real com CORS. O teste React verifica carregamento, busca, resultado vazio, falha, repetição e limpeza. O teste HTTP precisa de permissão para abrir uma porta local temporária. O build ainda apresenta avisos preexistentes sobre dependências e um hook em `Resposta.js`.

## Limites e decisões

A filtragem em JavaScript garante comparação Unicode consistente e caracteres literais sem interpolar entrada em SQL. Ela carrega todas as perguntas: escolha proporcional ao fórum didático, inadequada para grandes volumes sem paginação/indexação futura. O banco de produção não é alterado pela busca. O modelo legado permanece responsável pelos cadastros e respostas; a aplicação de DIP aqui se restringe à nova funcionalidade. Não foi necessário acrescentar dependências.
