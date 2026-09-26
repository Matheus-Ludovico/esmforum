const criarBusca = require('../servicos/buscar_perguntas');
const criarRepositorio = require('../repositorios/perguntas_sqlite');
const Database = require('better-sqlite3');
const criarApp = require('../app');

const perguntas = [
  { id_pergunta: 1, texto: 'Programação em JavaScript', num_respostas: 2 },
  { id_pergunta: 2, texto: "100% _ ' SQL", num_respostas: 0 }
];
const buscar = criarBusca({ listar: () => perguntas });

test.each(['', '   '])('consulta %j lista todas as perguntas', consulta => {
  expect(buscar(consulta)).toEqual(perguntas);
});
test('pesquisa trecho, espaços externos e maiúsculas Unicode', () => {
  expect(buscar(' PROGRAMAÇÃO ')).toEqual([perguntas[0]]);
  expect(buscar('script')).toEqual([perguntas[0]]);
  expect(buscar('inexistente')).toEqual([]);
});
test.each(['%', '_', "'", "' OR 1=1 --"] )('trata %j como texto literal', termo => {
  expect(buscar(termo)).toEqual(termo.includes('OR') ? [] : [perguntas[1]]);
});
test('rejeita consulta não textual e isola instâncias', () => {
  expect(() => buscar([])).toThrow(TypeError);
  expect(criarBusca({ listar: () => [] })('')).toEqual([]);
  expect(buscar()).toEqual(perguntas);
});
test('SQLite integra busca e contagem sem modificar os registros', () => {
  const db = new Database(':memory:');
  try {
    db.exec(require('fs').readFileSync(require('path').join(__dirname, '../bd/schema.sql'), 'utf8'));
    db.prepare('INSERT INTO perguntas (texto, id_usuario) VALUES (?, 1)').run('AÇÃO 100%');
    db.prepare('INSERT INTO perguntas (texto, id_usuario) VALUES (?, 1)').run('Outra');
    db.exec("INSERT INTO respostas (id_pergunta, texto) VALUES (1, 'Sim'), (1, 'Não')");
    const repositorio = criarRepositorio({ queryAll: (sql, params) => db.prepare(sql).all(params) });
    const consulta = criarBusca(repositorio);
    expect(consulta('ação')[0]).toMatchObject({ id_pergunta: 1, num_respostas: 2 });
    expect(consulta('%')).toHaveLength(1);
    expect(consulta('')[1].num_respostas).toBe(0);
    expect(consulta("' OR 1=1 --")).toEqual([]);
    expect(repositorio.listar()).toHaveLength(2);
  } finally { db.close(); }
});

describe('API HTTP', () => {
  let servidor;
  let url;
  beforeAll(async () => {
    servidor = criarApp({}, buscar).listen(0, '127.0.0.1');
    await new Promise(resolve => servidor.once('listening', resolve));
    url = `http://127.0.0.1:${servidor.address().port}`;
  });
  afterAll(done => { servidor.close(done); });
  test('preserva listagem e filtra com q', async () => {
    expect(await (await fetch(url)).json()).toEqual(perguntas);
    const resposta = await fetch(`${url}/?q=SCRIPT`);
    expect(resposta.headers.get('access-control-allow-origin')).toBe('*');
    expect(await resposta.json()).toEqual([perguntas[0]]);
  });
  test('consulta estruturada retorna 400', async () => {
    expect((await fetch(`${url}/?q[]=a`)).status).toBe(400);
  });
});
