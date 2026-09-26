# ESM Forum

Para configurar os forks desta entrega e executar backend e frontend, consulte [INSTALACAO.md](INSTALACAO.md).

Práticas de XP: [análise de design simples](DESIGN_SIMPLES.md) e [planejamento de pair programming](PAIR_PROGRAMMING.md).

Qualidade do código: [análise SOLID do backend](ANALISE_SOLID.md).

Requisitos: [três histórias de usuário com critérios de aceitação e priorização](HISTORIAS.md).

Detalhamento: [caso de uso de busca de perguntas por palavra-chave](CASO_DE_USO.md).

O **ESM Forum** é um sistema minimalista de demonstração do livro [Engenharia de Software Moderna](https://engsoftmoderna.info). 
Ele é um fórum simples de perguntas e respostas. O objetivo é permitir que os alunos tenham um primeiro contato prático com os conceitos estudados no livro. Ou seja:

* Trata-se de um sistema com objetivo didático e, por isso, não temos a intenção de colocá-lo em produção. 
* Também não temos a intenção de implementar um sistema completo, com todas as funcionalidades possíveis.

## Frontend
 
A interface do sistema é também muito simples, conforme  mostrado abaixo. 

![Primeiro screenshot](docs/screen1.png)

O frontend está implementado, usando React, em um [repositório](https://github.com/mtov/esmforum-react) separado.

## Backend

O backend do sistema, que está neste repositório, usa JavaScript e também as seguintes tecnologias:

  * [Node.js](https://nodejs.org/en), um sistema que permite a execução de programas JavaScript fora de browsers, isto é, em servidores.
  * [Express](https://expressjs.com), uma biblioteca para construção de aplicações Web em Node.js.
  * [SQLite](https://www.sqlite.org), um banco de dados relacional simples.
  * [Jest](https://jestjs.io/), um framework para implementação de testes de unidade e de integração.

### Instalação e Execução do Backend

Veja neste [link](docs/instalacao.md).

## Praticando o Conteúdo do Livro

* [Histórias de Usuários e Backlog](docs/backlog.md)
* [Arquitetura MVC](docs/arquitetura.md)
* [Diagramas de Sequência](docs/uml.md)
* Testes:
  * [Testes de Unidade](docs/testes-unidade.md)
  * [Testes de Integração](docs/testes-integracao.md)
  * [Testes End-to-End](docs/testes-e2e.md)
* [Integração Contínua](docs/ci.md)

## Diagramas UML como sketch

Os quatro diagramas abaixo comunicam as principais estruturas e comportamentos das extensões escolhidas em [HISTORIAS.md](HISTORIAS.md). São modelos leves do comportamento esperado, não uma afirmação de que as funcionalidades já foram implementadas. Votação e notificações permanecem fora do escopo destes sketches.

### Classes — domínio e extensões

Modelo conceitual para busca, tags e perfil. O backend atual é procedural: Pergunta e Resposta estão representadas no banco; Usuario ainda não possui uma tabela própria, e a autoria das perguntas usa um ID fixo. A identidade persistente de Usuario, a autoria das respostas e Tag são propostas de extensão.

As multiplicidades indicam quantos objetos podem estar associados: cada resposta pertence a uma pergunta; usuários podem ter várias contribuições; perguntas e tags têm associação muitos-para-muitos. O autor é opcional (0..1) apenas para acomodar conteúdo legado de autoria desconhecida; novas perguntas e respostas exigem exatamente um autor autenticado. As chaves estrangeiras são representadas pelas associações para evitar duplicação visual. Perfil/histórico são consultas sobre Usuario, Pergunta e Resposta, e busca é uma operação: não precisam de classes persistentes próprias. Campos de autenticação e tabelas de associação ficam fora deste sketch.

[Fonte Mermaid: classes.mmd](docs/diagramas/classes.mmd)

```mermaid
classDiagram
    direction LR

    class Usuario {
        +int id_usuario
        +string nome_exibicao
    }
    class Pergunta {
        +int id_pergunta
        +string texto
    }
    class Resposta {
        +int id_resposta
        +string texto
    }
    class Tag {
        +int id_tag
        +string nome
    }

    Usuario "0..1" -- "0..*" Pergunta : autor de
    Usuario "0..1" -- "0..*" Resposta : autor de
    Pergunta "1" -- "0..*" Resposta : recebe
    Pergunta "0..*" -- "0..*" Tag : categorizada por

    note for Usuario "Identidade persistente proposta para o perfil.<br/>O histórico deriva das relações de autoria."
    note for Pergunta "Novas contribuições têm exatamente um autor.<br/>0..1 permite autoria desconhecida no legado."
    note for Tag "Nova classe: tecnologia, carreira, dúvidas-gerais.<br/>Perguntas legadas podem não ter tags."
```

### Sequência — buscar perguntas por palavra-chave

Interação do [UC-01](CASO_DE_USO.md) entre visitante, interface, API, modelo e banco. Inclui consulta vazia, resultado vazio e falha de processamento. As mensagens nomeiam responsabilidades propostas, sem impor novas classes JavaScript ou um contrato HTTP definitivo. Um filtro por tag só se aplica quando a extensão de tags estiver disponível.

[Fonte Mermaid: sequencia-busca.mmd](docs/diagramas/sequencia-busca.mmd)

```mermaid
sequenceDiagram
    autonumber
    actor V as Visitante
    participant F as :Frontend React
    participant A as :API Express
    participant M as :Modelo
    participant B as :Banco SQLite

    Note over V,B: UC-01 — busca de perguntas, sem exigir autenticação
    F-->>V: Apresentar listagem e campo de busca
    V->>F: Informar consulta e acionar busca
    F->>F: Exibir carregamento
    F->>A: Consultar perguntas (texto, tag opcional)
    A->>A: Verificar consulta vazia ou só espaços
    alt Consulta sem texto
        A->>M: Listar perguntas (tag opcional)
    else Consulta com texto
        A->>M: Buscar perguntas (texto, tag opcional)
    end
    M->>B: Executar consulta parametrizada somente de leitura
    Note over M,B: Comparar texto sem diferenciar maiúsculas/minúsculas.<br/>Aplicar tag se ativa. Tratar caracteres como texto.
    alt Consulta processada com sucesso
        B-->>M: Perguntas encontradas ou lista vazia
        M-->>A: Resultado
        A-->>F: HTTP 200 e lista de perguntas
        F->>F: Encerrar carregamento e manter consulta visível
        alt Lista com perguntas
            F-->>V: Exibir perguntas correspondentes
        else Lista vazia
            F-->>V: Exibir Nenhuma pergunta encontrada
        end
    else Falha no processamento
        B-->>M: Erro de consulta
        M-->>A: Propagar erro
        A-->>F: Resposta de erro
        F->>F: Encerrar carregamento e manter consulta
        F-->>V: Informar falha e oferecer nova tentativa
    end
    Note over V,F: Alterar ou limpar inicia nova consulta.<br/>Repetir após falha reutiliza os mesmos filtros.<br/>Falha de rede também exibe erro, nunca lista vazia como sucesso.
```

### Atividades — fluxo da busca

Representação leve do fluxo de atividades com `flowchart` do Mermaid: círculos marcam início/fim, retângulos representam atividades e diamantes representam decisões. Os caminhos incluem alterar, limpar e repetir a busca. A decisão de falha resume erros de comunicação ou processamento. Não há atividades paralelas obrigatórias neste caso de uso; por isso não foram adicionados forks/joins.

[Fonte Mermaid: atividades-busca.mmd](docs/diagramas/atividades-busca.mmd)

```mermaid
flowchart TD
    inicio((Início)) --> exibir[Exibir listagem e campo de busca]
    exibir --> informar[Visitante informa ou altera a consulta]
    informar --> enviar[Acionar busca e exibir carregamento]
    enviar --> vazia{Consulta vazia ou só espaços?}
    vazia -->|Sim| todas[Selecionar todas as perguntas]
    vazia -->|Não| buscar[Buscar trecho sem diferenciar maiúsculas e minúsculas]
    todas --> filtro[Aplicar filtro por tag, se ativo]
    buscar --> filtro
    filtro --> consultar[Executar consulta parametrizada somente de leitura]
    consultar --> sucesso{Consulta concluída sem falha?}
    sucesso -->|Não| erro[Encerrar carregamento e informar falha]
    erro --> repetir{Ação do visitante?}
    repetir -->|Tentar novamente| enviar
    repetir -->|Alterar consulta| informar
    repetir -->|Abandonar| fim((Fim))
    sucesso -->|Sim| encerrar[Encerrar carregamento e manter consulta visível]
    encerrar --> encontrados{Há perguntas correspondentes?}
    encontrados -->|Sim| resultados[Exibir resultados]
    encontrados -->|Não| vazio[Exibir Nenhuma pergunta encontrada]
    resultados --> acao{Ação do visitante?}
    vazio --> acao
    acao -->|Alterar consulta| informar
    acao -->|Limpar busca| limpar[Esvaziar campo de busca]
    limpar --> enviar
    acao -->|Encerrar consulta| fim
```

### Estados — Pergunta

Estado derivado da quantidade de respostas, sem necessidade de armazenar um atributo de estado adicional. A criação bem-sucedida inicia a pergunta sem respostas; a primeira resposta muda seu estado e as seguintes o mantêm. Falhas ao cadastrar uma resposta não alteram esse estado. Busca, leitura do perfil e categorização não mudam a condição de ter respostas. Não há estado final nem transição de exclusão: encerramento, exclusão e marcação como resolvida não foram solicitados. Perguntas já existentes têm o estado determinado por suas respostas atuais.

[Fonte Mermaid: estados-pergunta.mmd](docs/diagramas/estados-pergunta.mmd)

```mermaid
stateDiagram-v2
    direction LR
    state "Sem respostas" as SemRespostas
    state "Com respostas" as ComRespostas

    [*] --> SemRespostas : cadastrar pergunta com sucesso
    SemRespostas --> ComRespostas : registrar primeira resposta com sucesso
    ComRespostas --> ComRespostas : registrar outra resposta com sucesso

    note right of SemRespostas
        Quantidade de respostas = 0
    end note
    note right of ComRespostas
        Quantidade de respostas maior ou igual a 1
        Ter resposta não significa estar resolvida.
    end note
```

Os blocos acima reproduzem os arquivos `.mmd`; ao editar um diagrama, atualize também seu bloco no README. Notação baseada na documentação oficial do Mermaid: [classes](https://mermaid.js.org/syntax/classDiagram.html), [sequência](https://mermaid.js.org/syntax/sequenceDiagram.html), [fluxogramas](https://mermaid.js.org/syntax/flowchart.html) e [estados](https://mermaid.js.org/syntax/stateDiagram.html).
