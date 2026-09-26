const criarApp = require('./app');
const modelo = require('./modelo');
const bd = require('./bd/bd_utils');
const criarRepositorioPerguntas = require('./repositorios/perguntas_sqlite');
const criarBuscaPerguntas = require('./servicos/buscar_perguntas');

const buscarPerguntas = criarBuscaPerguntas(criarRepositorioPerguntas(bd));
const app = criarApp(modelo, buscarPerguntas);
const port = 5000;
app.listen(port, 'localhost', () => {
  console.log(`ESM Forum rodando em ${port}`);
});
