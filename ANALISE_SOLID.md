# Análise SOLID do backend do ESM Forum

## Escopo e critérios

Código analisado: commit `97b62f6b24225ee4ffef300f39f6c63229769c89` do backend.

Nesta versão, **não existem diretórios `routes/` e `models/`**. As rotas estão em [server.js](server.js), as operações do modelo em [modelo.js](modelo.js) e o acesso ao SQLite em [bd/bd_utils.js](bd/bd_utils.js). Os exemplos abaixo foram extraídos desses arquivos e de seus testes.

SOLID pode orientar responsabilidades e dependências de funções e módulos JavaScript, mesmo sem classes. Esta análise identifica **três pontos positivos e duas oportunidades de melhoria**. Um aspecto local pode respeitar um princípio sem que todo o módulo o respeite. Os exemplos de melhoria são propostas ilustrativas; não foram aplicados ao backend nesta entrega.

## A. Pontos positivos

### 1. Rota delega a operação ao modelo — SRP

**Princípio:** Responsabilidade Única (*Single Responsibility Principle*). Uma unidade deve concentrar uma responsabilidade, evitando razões de mudança independentes.

**Trecho atual:** `server.js`, linhas 24–32.

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

**Por que é positivo:** a função da rota adapta uma requisição HTTP para uma chamada ao modelo e transforma o resultado em resposta HTTP. Ela não abre o banco nem constrói SQL. Uma alteração na consulta de inserção pode ficar no modelo, sem alterar essa função enquanto o contrato de entrada e saída for preservado.

Leitura do corpo, chamada ao modelo e composição da resposta são partes da mesma responsabilidade de adaptação HTTP; SRP não significa que uma função só possa executar uma instrução. Este ponto avalia a função da rota, não a organização completa de `server.js`, discutida em B.1.

### 2. Execução de SQL concentrada em um módulo de persistência — SRP

**Princípio:** Responsabilidade Única (*Single Responsibility Principle*).

**Trecho atual:** `bd/bd_utils.js`, linhas 9–18.

```js
function query(query, params) {
  return bd.prepare(query).get(params);
}

function queryAll(query, params) {
  return bd.prepare(query).all(params);
}

function exec(statement, params) {
  return bd.prepare(statement).run(params);
}
```

**Por que é positivo:** preparação e execução de comandos ficam em uma unidade de persistência. Esse trecho não conhece requisições Express, componentes React ou regras de votação. Seus três métodos representam operações relacionadas de acesso ao banco: consultar um registro, consultar vários e executar um comando.

Isso concentra detalhes de uso do driver e facilita localizar uma mudança de execução. Não significa independência completa de SQLite: o modelo ainda contém SQL e conhece o resultado `lastInsertRowid`, como discutido em B.2. Tampouco a existência de três métodos pequenos, sozinha, comprova o princípio de Segregação de Interfaces.

### 3. Ponto de extensão permite substituir o acesso a dados em testes — OCP

**Princípio:** Aberto/Fechado (*Open/Closed Principle*). Uma unidade pode admitir variações por um contrato de colaboração, preservando o código que utiliza esse contrato.

**Trecho atual:** `modelo.js`, linhas 5–7 e 15–19.

```js
function reconfig_bd(mock_bd) {
  bd = mock_bd;
}

function listar_perguntas() {
  const perguntas = bd.queryAll('select * from perguntas', []);
  perguntas.forEach(pergunta => pergunta['num_respostas'] = get_num_respostas(pergunta['id_pergunta']));
  return perguntas;
}
```

O teste `testes/listar_perguntas.test.js` fornece `mock_bd.queryAll` e `mock_bd.query` com `jest.fn()` e chama:

```js
modelo.reconfig_bd(mock_bd);
```

**Por que é positivo:** existe um ponto de extensão local. O teste substitui o colaborador de persistência para produzir dados controlados sem acrescentar condicionais de teste ou modificar `listar_perguntas`. O comportamento de listagem continua consumindo as operações esperadas do colaborador.

**Limite da evidência:** isso é uma aplicação restrita de OCP à substituição do colaborador nos cenários de leitura testados. Não prova que qualquer banco possa substituí-lo nem que todo o backend esteja fechado a modificações. O mock não implementa todas as operações de escrita, e a troca ocorre em uma variável compartilhada pelo módulo. O desenho também não comprova LSP: substituir um objeto em um teste não demonstra equivalência de todos os contratos comportamentais.

## B. Oportunidades de melhoria

### 1. Montagem da aplicação, rotas e abertura da porta no mesmo módulo — violação de SRP

**Princípio:** Responsabilidade Única (*Single Responsibility Principle*).

**Trechos atuais de `server.js`:**

```js
const express = require('express')
const modelo = require('./modelo.js');

const app = express()
app.use(express.json());
```

O mesmo arquivo registra as quatro rotas e, ao final, executa:

```js
const port = 5000;
app.listen(port, 'localhost', () => {
  console.log(`ESM Forum rodando em ${port}`)
});
```

**Por que viola o princípio:** no nível do módulo, existem razões de mudança distintas: configuração dos middlewares, evolução do contrato HTTP das rotas e inicialização do processo em uma porta. Além disso, importar esse arquivo inicia um servidor, dificultando reutilizar a aplicação em testes que precisam controlar quando abrir e fechar a porta.

**Como melhorar:** separar primeiro a construção da aplicação de sua inicialização. Uma função cria e retorna o objeto Express, enquanto um arquivo de entrada controla o processo. Não é necessário criar várias camadas ou uma classe para cada rota.

Exemplo proposto de `app.js` — recorte com uma rota:

```js
const express = require('express');

function criarApp(modelo) {
  const app = express();
  app.use(express.json());

  app.post('/perguntas', (req, res) => {
    try {
      const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
      res.json({ id_pergunta });
    } catch (erro) {
      res.status(500).json(erro.message);
    }
  });

  return app;
}

module.exports = criarApp;
```

Exemplo proposto de ponto de entrada `server.js`:

```js
const criarApp = require('./app');
const modelo = require('./modelo');

const app = criarApp(modelo);
app.listen(5000, 'localhost', () => {
  console.log('ESM Forum rodando em 5000');
});
```

Na refatoração completa, os middlewares existentes, incluindo CORS, e as demais rotas também seriam transferidos para a montagem da aplicação, preservando os caminhos e contratos. Separar posteriormente as rotas por assunto só seria necessário se o crescimento justificasse isso.

**Como verificar:** importar `criarApp` não deve abrir uma porta; a aplicação criada deve aceitar um modelo de teste. Verificar ainda os quatro endpoints, seus formatos de resposta e os cabeçalhos CORS antes e depois da extração.

### 2. Modelo importa persistência concreta e conhece detalhes do driver — violação de DIP

**Princípio:** Inversão de Dependência (*Dependency Inversion Principle*). A política de nível mais alto deve depender de contratos definidos por suas necessidades, e os detalhes de infraestrutura devem atender a esses contratos.

**Trecho atual:** `modelo.js`, linhas 1 e 21–25.

```js
var bd = require('./bd/bd_utils.js');

function cadastrar_pergunta(texto) {
  const params = [texto, 1];
  const result = bd.exec('INSERT INTO perguntas (texto, id_usuario) VALUES(?, ?) RETURNING id_pergunta', params);
  return result.lastInsertRowid;
}
```

O módulo importado instancia diretamente a implementação concreta:

```js
const Database = require('better-sqlite3');

var bd = new Database('./bd/esmforum.db');
```

**Por que viola o princípio:** a operação de cadastro importa a infraestrutura, conhece a estrutura SQL e interpreta uma propriedade específica do resultado do driver. Importar o modelo também provoca a abertura do banco, antes mesmo de um teste chamar `reconfig_bd`. Logo, a dependência de nível mais alto não se limita a um contrato de domínio independente da infraestrutura.

**Como melhorar:** fornecer ao modelo um colaborador com um contrato mínimo, por exemplo `inserirPergunta(texto, idUsuario) -> id`. O adaptador SQLite implementa o SQL e traduz o resultado para o identificador. Uma função de composição conecta as implementações; cada instância do modelo recebe seu colaborador, eliminando a troca global para testes.

Exemplo proposto do modelo, restrito ao cadastro:

```js
function criarModelo(perguntas) {
  return {
    cadastrar_pergunta(texto) {
      return perguntas.inserirPergunta(texto, 1);
    }
  };
}

module.exports = criarModelo;
```

Exemplo proposto do adaptador SQLite:

```js
function criarRepositorioPerguntas(conexao) {
  return {
    inserirPergunta(texto, idUsuario) {
      const resultado = conexao.prepare(
        'INSERT INTO perguntas (texto, id_usuario) VALUES (?, ?)'
      ).run(texto, idUsuario);
      return resultado.lastInsertRowid;
    }
  };
}

module.exports = criarRepositorioPerguntas;
```

Nesse recorte, o valor de usuário `1` mantém a regra atual para não misturar a refatoração com a implementação de autenticação. O card de perfil deve tratar essa regra separadamente. A composição abriria a conexão e a passaria ao adaptador, que seria fornecido a `criarModelo`; os outros métodos seriam migrados conforme a necessidade, sem criar um repositório genérico com operações especulativas.

**Como verificar:** criar duas instâncias com colaboradores de teste distintos e confirmar que não interferem entre si; exercitar o cadastro sem abrir SQLite no teste do modelo; testar separadamente se o adaptador insere e retorna o ID correto. A mera passagem de `bd` como parâmetro, mantendo SQL e `lastInsertRowid` no modelo, melhoraria a testabilidade, mas não resolveria toda a dependência descrita.

## Síntese e aplicação proporcional

| Tipo | Trecho | Princípio | Resultado da análise |
| --- | --- | --- | --- |
| Positivo 1 | Função da rota `POST /perguntas` | SRP | Adaptação HTTP delega o cadastro ao modelo. |
| Positivo 2 | `query`, `queryAll` e `exec` em `bd_utils.js` | SRP | Execução de comandos está concentrada na persistência. |
| Positivo 3 | `reconfig_bd` e listagem com colaborador substituível | OCP, em escopo local | Variações de leitura nos testes não exigem alterar o algoritmo. |
| Melhoria 1 | Organização completa de `server.js` | SRP | Separar montagem da aplicação e inicialização do servidor. |
| Melhoria 2 | Importação de banco, SQL e retorno do driver em `modelo.js` | DIP | Usar contrato mínimo de persistência orientado à operação e composição explícita. |

Os três pontos positivos não precisam representar três princípios diferentes. O código fornece evidência mais clara de separação de responsabilidades e de um ponto de extensão local do que de todos os cinco princípios. Não foram atribuídos artificialmente LSP ou ISP a trechos sem evidência suficiente.

Para este projeto didático, as melhorias devem ser incrementais. SOLID não exige classes, interfaces formais em TypeScript, hierarquias de herança ou contêineres de injeção. Pequenas funções e contratos explícitos são suficientes para tratar os problemas identificados, preservando o design simples.
