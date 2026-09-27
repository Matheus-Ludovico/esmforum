# Instalação do ESM Forum — Tarefa 1

## Repositórios

- Backend (fork): https://github.com/Matheus-Ludovico/esmforum
- Frontend (fork): https://github.com/Matheus-Ludovico/esmforum-react
- Origens: https://github.com/jeffsantos/esmforum e https://github.com/jeffsantos/esmforum-react

Os forks foram criados na conta Matheus-Ludovico. Cada projeto é um repositório Git independente. Nas cópias locais, `origin` aponta para o fork e `upstream` para o projeto de jeffsantos.

## Pré-requisitos

Tenha acesso à internet para baixar as dependências e mantenha as portas 3000 e 5000 livres.

Confira as ferramentas:

```bash
node --version
npm --version
git --version
```

Os arquivos `.nvmrc` dos forks registram a versão de Node utilizada. Se você já usa nvm, execute `nvm install` e `nvm use` dentro de cada projeto.

O SQLite é embarcado: o backend usa `better-sqlite3` e já inclui `bd/esmforum.db`. Não é necessário instalar ou iniciar um servidor de banco de dados, configurar senha ou criar um arquivo `.env`. A ferramenta de linha de comando `sqlite3` é opcional e não foi necessária na validação.

## Clonagem

Em um diretório de trabalho:

```bash
git clone https://github.com/Matheus-Ludovico/esmforum.git
git clone https://github.com/Matheus-Ludovico/esmforum-react.git
git -C esmforum remote add upstream https://github.com/jeffsantos/esmforum.git
git -C esmforum-react remote add upstream https://github.com/jeffsantos/esmforum-react.git
```

Para reproduzir a criação dos forks em outra conta, use o botão **Fork** em cada repositório de origem e substitua `Matheus-Ludovico` nos comandos pelo seu usuário. Como alternativa, com GitHub CLI autenticado, use `gh repo fork jeffsantos/esmforum --clone=false` e `gh repo fork jeffsantos/esmforum-react --clone=false`.

## Backend — terminal 1

```bash
cd esmforum
npm ci
node server.js
```

Use `npm ci` para instalar as versões registradas no `package-lock.json`. No ambiente desta entrega foi utilizado um cache temporário com `npm ci --cache /tmp/esmforum-npm-cache`; esse parâmetro não é necessário em uma instalação comum.

A mensagem esperada é `ESM Forum rodando em 5000`. A API estará em http://localhost:5000 e a rota `/` retorna as perguntas em JSON. Execute o servidor a partir da raiz de `esmforum`, pois o caminho do banco é relativo ao diretório atual. Os dados são persistidos no arquivo `bd/esmforum.db`.

## Frontend — terminal 2

Em outro terminal, a partir do diretório que contém os dois clones:

```bash
cd esmforum-react
npm ci
npm start
```

Abra http://localhost:3000 no navegador. O frontend React acessa a API em `http://localhost:5000`, endereço definido em `src/pages/Pergunta.js` e `src/pages/Resposta.js`. Mantenha o backend ligado. Para iniciar sem abrir automaticamente o navegador e restringir o frontend à máquina local, como nesta validação:

```bash
BROWSER=none HOST=localhost npm start
```

Encerre cada servidor com `Ctrl+C` no respectivo terminal.

## Verificação

Com os dois servidores ativos, em um terceiro terminal:

```bash
curl -i http://localhost:5000/
curl -I http://localhost:3000/
```

Ambos devem responder `HTTP/1.1 200 OK`; o primeiro retorna JSON e o segundo os cabeçalhos da página HTML.

Testes existentes do backend, executados dentro de `esmforum`:

```bash
npm test -- --runInBand
```

Os testes usam `bd/esmforum-teste.db` e alteram esse arquivo versionado. Não inclua as mudanças do banco de teste nos commits de código.

Build do frontend, executado dentro de `esmforum-react`:

```bash
npm run build
```

O resultado fica em `build/`, ignorado pelo Git. Para uma conferência manual adicional, abra a interface, cadastre uma pergunta, abra suas respostas e cadastre uma resposta; esses cadastros ficam no banco local.

### Resultados obtidos nesta entrega

- Instalação por `npm ci` concluída nos dois projetos, preservando os arquivos de lock.
- Backend iniciado na porta 5000; `GET /` retornou HTTP 200 e a lista de perguntas do banco incluído no projeto.
- Frontend iniciado na porta 3000; a consulta HTTP retornou 200 e conteúdo do tipo HTML.
- Backend: 2 suítes e 3 testes aprovados.
- Frontend: build concluído com avisos existentes em dependências e em `src/pages/Resposta.js:94` (dependência `id_pergunta` do `useEffect`).


## Problemas comuns

- **Porta ocupada:** encerre a outra aplicação que usa 3000 ou 5000. O backend fixa a porta 5000 em `server.js`; alterar apenas `PORT` não muda a porta dessa API.
- **Frontend sem perguntas:** confira se http://localhost:5000 responde e se o backend está ativo. A interface deve ser aberta na mesma máquina onde roda a API.
- **Erro ao carregar `better-sqlite3`:** use a versão de Node registrada em `.nvmrc` e reinstale com `npm ci`. Se o ambiente não tiver binário pré-compilado compatível, será necessário Python 3, make e compilador C/C++; em Ubuntu, podem ser instalados com `sudo apt install python3 build-essential`.
- **Scripts de instalação bloqueados pelo npm:** revise a política local e permita os scripts de `better-sqlite3` e `sqlite3` quando necessário; não desative indiscriminadamente a política de scripts.
- **Banco não encontrado ou tabela inexistente:** confirme que está na raiz de `esmforum` e que `bd/esmforum.db` está presente. O script original `bd/criar_bd.sh` apaga o banco e cria tabelas vazias; só o execute deliberadamente, com o servidor parado e após backup. Ele depende do utilitário opcional `sqlite3` (`sudo apt install sqlite3` no Ubuntu).
- **Avisos de dependências antigas:** a instalação mantém as versões do projeto didático. Consulte `npm audit` para investigar; atualizações devem ser tratadas e testadas separadamente.
