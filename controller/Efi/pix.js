const EfiPay = require('sdk-node-apis-efi');
const options = require('./credentials');

const gerarPiximediato = async (clienteData) => {
    let body = {
        calendario: {
            expiracao: 3600,
        },
        devedor: {
            cpf: '01729517129',
            nome: 'Guilherme Pecois Arakaki',
        },
        valor: {
            original: '123.45',
        },
        chave: '5e9c0147-66c6-4a06-bba6-3ce47b2a3da2', // Informe sua chave Pix cadastrada na efipay.	
        infoAdicionais: [
            {
                nome: 'Pagamento em',
                valor: 'Pax Nippon',
            },
            {
                nome: 'Pedido',
                valor: 'NUMERO DO PEDIDO DO CLIENTE',
            },
        ],
    };

    const efipay = new EfiPay(options);

    let params = {
        txid: 'https://api.webhookinbox.com/i/S4NEuAYC/in/',
    };

    const result = await efipay.pixCreateCharge(params, body);

    console.log(result);
    return result;

};

module.exports = { gerarPiximediato };
