const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection } = require("firebase/firestore")

async function getArrayLength() {
  const url = 'http://192.168.1.11:8083/relatorio_mensalidade_atraso?DTVENCIMENTO_INI=01/08/2023&DTVENCIMENTO_FIM=31/08/2023';

  try {
    const response = await axios.get(url);
    const array = await response.data; // Supondo que a API retorna o array diretamente no corpo da resposta
    const arrayLength = array.length;
    getContratos();
    console.log(`A quantidade de elementos no array é: ${arrayLength}`);
    return arrayLength;

  } catch (error) {
    console.error('Erro ao fazer a requisição:', error.message);
    return 0;
  }
}
async function getContratos() {
  const url = 'http://192.168.1.11:8083/query';
  const query = `select * from CONTRATO WHERE situacao = 'Mensal'`;
  try {
    const response = await axios.post(url, query,
      {
        headers: {
          'Content-Type': 'text/plain', // Indicando que os dados são texto simples (RAW)
        }
      }
    );
    const array = await response.data; // Supondo que a API retorna o array diretamente no corpo da resposta
    const arrayLength = array.length;
    console.log(`A quantidade de contratos é: ${arrayLength}`);
    return arrayLength;

  } catch (error) {
    console.error('Erro ao fazer a requisição:', error.message);
    return 0;
  }
}

async function getDisparosFireBase() {


  try {
    const querySnapshot = await getDocs(collection(db, "disparosWhats"));
    const data = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error.message);
    return null;
  }
}
async function getDataQuery() {
  const url = 'http://192.168.1.11:8083/query';
  const query = `
      SELECT DISTINCT M.IDCONTRATO, M.IDCONVENIO, co.RAZAOSOCIAL as NOMECONVENIO, C.NOMECLIENTE, C.CPF, CT.SITUACAO, ct.DIAVENCIMENTO, d.DESCRICAO as NOMEDEPARTAMENTO,
      CT.DTCONTRATO, C.FONE, C.FONETRABALHO, C.FONE_TITULAR, C.FONE_WHATSAP, CT.FONECOB, S.DESCRICAO as SETOR,
      d.DESCRICAO as DEPARTAMENTO, CT.IDSETOR, CT.IDDEPARTAMENTO, CT.valor_mensalidade
      FROM MENSALIDADE M
      LEFT JOIN CONTRATO CT
        ON CT.IDFILIAL = M.IDFILIAL
        AND CT.IDCONTRATO = M.IDCONTRATO
        AND CT.IDCONVENIO = M.IDCONVENIO
      LEFT JOIN CLIENTE C
        ON C.IDFILIAL = CT.IDFILIAL
        AND C.IDCLIENTE = CT.IDCLIENTE
      LEFT JOIN CONVENIO CO
        ON CO.IDFILIAL = M.IDFILIAL
        AND CO.IDCONVENIO = M.IDCONVENIO
      LEFT JOIN SETOR S
        ON S.IDFILIAL = M.IDFILIAL
        AND S.IDSETOR = CT.IDSETOR
      LEFT JOIN DEPARTAMENTO D
        ON D.IDFILIAL = CT.IDFILIAL
        AND D.IDDEPARTAMENTO = CT.IDDEPARTAMENTO
      WHERE M.IDFILIAL = 1
        AND M.DTVENCIMENTO BETWEEN '01.08.2023' AND '16.08.2023'
        AND M.VALORPAGO IS NOT NULL
        AND CT.SITUACAO = 'Mensal'
    `;

  try {
    const response = await axios.post(url, query,
      {
        headers: {
          'Content-Type': 'text/plain', // Indicando que os dados são texto simples (RAW)
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = response.data;
    const arrayLength = data.length;
    console.log(`A quantidade de elementos no array é: ${arrayLength}`);
    return data;

  } catch (error) {
    console.error('Erro ao fazer a requisição:', error.message);
    return null;
  }
}



module.exports = {
  getDisparosFireBase: getDisparosFireBase,
  getArrayLength: getArrayLength,
  getDataQuery: getDataQuery,
  getContratos: getContratos
}