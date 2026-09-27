const express = require('express')

function criarApp(modelo, buscarPerguntas) {

const app = express()
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  if (req.query.q !== undefined && typeof req.query.q !== 'string') {
    return res.status(400).json('A consulta deve ser um texto.');
  }
  try {
    const perguntas = buscarPerguntas(req.query.q);
    res.send(perguntas);
  }
  catch(erro) {
    res.status(500).json(erro.message);
  }
});

app.post('/perguntas', (req, res) => {
  try {
    const id_pergunta = modelo.cadastrar_pergunta(req.body.pergunta);
    res.json({id_pergunta: id_pergunta});
  }
  catch(erro) {
    res.status(500).json(erro.message); 
  } 
});

app.get('/respostas/:id_pergunta', (req, res) => {
  const id_pergunta = req.params.id_pergunta;
  try {
    const pergunta = modelo.get_pergunta(id_pergunta);
    const respostas = modelo.get_respostas(id_pergunta);
    res.json({
      pergunta: pergunta,
      respostas: respostas
    });
  }
  catch(erro) {
    res.status(500).json(erro.message); 
  } 
});

app.post('/respostas', (req, res) => {
  try {
    const id_pergunta = req.body.id_pergunta;
    const resposta = req.body.resposta;
    const id_resposta = modelo.cadastrar_resposta(id_pergunta, resposta);
    res.json({id_resposta: id_resposta});
  }
  catch(erro) {
    res.status(500).json(erro.message); 
  } 
});

  return app;
}

module.exports = criarApp;
