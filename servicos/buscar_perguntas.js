/**
 * Contrato mínimo do repositório (síncrono):
 * listar(): Array<{id_pergunta, texto, id_usuario, num_respostas}>.
 * A implementação deve retornar os dados sem alterá-los.
 */
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

module.exports = criarBuscaPerguntas;
