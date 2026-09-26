// Adaptador do contrato listar() definido pelo serviço de busca.
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

module.exports = criarRepositorioPerguntas;
