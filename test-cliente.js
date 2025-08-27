const { AddCliente } = require('./controller/clientes');

// Dados de teste baseados no que você mostrou
const dadosTeste = {
  nome_titular: 'MARINILZA CLELIA DE BRITO FERREIRA',
  sexo: 'feminino',
  estado_civil: 'Viúvo',
  cpf: '32193700125',
  rg: '000228375',
  uf: 'CAMPO GRANDE',
  email: 'marinilzacleliabbotelhob@gmail.com',
  telefone_princ: '67996070608',
  data_nasc: '1965-08-23',
  telefone_trabalho: 'FUNC PUBLICA',
  cep: '79008530',
  endereco: 'Rua Feliciana Carolina',
  bairro: 'Cabreúva',
  cidade: 'Campo Grande',
  estado: 'MS',
  number_end: '160'
};

async function testarAddCliente() {
  try {
    console.log('Iniciando teste da função AddCliente...');
    const resultado = await AddCliente(dadosTeste);
    
    if (resultado) {
      console.log('✅ Cliente adicionado com sucesso!');
      console.log('ID do cliente:', resultado.id);
    } else {
      console.log('❌ Falha ao adicionar cliente');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testarAddCliente(); 