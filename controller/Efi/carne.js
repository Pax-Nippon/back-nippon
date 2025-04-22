const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')
const { formatDate, limparNumero } = require('../../functions')
const { db } = require('../../firebase');
const { setDoc, doc } = require("firebase/firestore");
const { uniKey, typeReturn } = require('../../functions');
const { getNotification } = require('./notification');
const {addBoletoCarne} =  require('../mensalidades')




const organizaCarne = async (data) => {
    let auxCarne = [];
    let items=[];
    // Verifica se 'data' está definido e se 'carnes' é uma matriz não vazia
    if (data && data.carnes && data.carnes.length > 0) {
        // Utilize 'for...of' para iterar de forma assíncrona
        for (const element of data.carnes) {
            const exist = auxCarne.findIndex((item) => item.id === element.idContrato);
            if (exist !== -1) {
                // Se existir, adicione 'dataVenc' à entrada existente
                auxCarne[exist].dataVenc.push(element.dataVenc);
            } else {
                // Caso contrário, crie uma nova entrada em 'auxCarne'
                auxCarne.push({
                    id: element.idContrato,
                    valor: element.valor,
                    dataVenc: [element.dataVenc],
                    abreviacao: element.abreviacao,
                });
                items.push({
                    name: element.abreviacao,
                    value: element.valor * 100,
                    amount: 1,
                })
            }
        }
    }

    let dataVencMenor = 31; // Inicialize com um valor alto para garantir que qualquer dia seja menor

    auxCarne.forEach((element) => {
        let dia = Number(element.dataVenc[0].split('/')[0]);
        if (dia < dataVencMenor) {
            dataVencMenor = element.dataVenc[0];
        }
    });

    const newId = uniKey();
    const dataAux = {
        metadata: {
            // notification_url: 'https://api.webhookinbox.com/i/dB0SV39S/in/',
            notification_url: 'https://api-nippon-prod-20e147260329.herokuapp.com/carne/changeStatus',
            custom_id: newId,
        },
        items: items,
        customer: {
            name: data.cliente.nome_titular,
            email: data.cliente.email,
            cpf: data.cliente.cpf,
            birth: formatDate(data.cliente.data_nasc),
            phone_number: limparNumero(data.cliente.telefone_princ),
        },
        repeats: auxCarne[0]?.dataVenc?.length,
        // message: "Este é um espaço de até 80 caracteres para informar algo a seu cliente",
        split_items: false,
        expire_at: formatDate(dataVencMenor)
    }

    return dataAux;
};

const createCarneEfi = async (data) => {
    const carnes = await organizaCarne(data);

    const efipay = new EfiPay(options);

    efipay.createCarnet({}, carnes)
    .then((resposta) => {
        const dataAux = {
            data: data,
            carnes: carnes,
            carneResponse: resposta
        }
        const result = addBoletoCarne(dataAux);
        return(result)
    })
    .catch((error) => {
    	console.log(error)
        throw new Error(error)
    })
    return true;
}


const listenCarne = async (data) => {
    const result = await getNotification(data);
    return result;
}

module.exports = { createCarneEfi, listenCarne };



