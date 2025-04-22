





const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')
const {formatDate, limparNumero, adicionarDias} = require('../../functions')
const clientFunctions = require('../clientes')
const {getMensalidadeUnica, addBoleto} = require('../mensalidades')


//     let body = {
//         payment: {
//             banking_billet: {
//                 expire_at: '2024-09-20',
//                 customer: {
//                     name: 'Gorbadoc Oldbuck',
//                     email: 'oldbuck@efipay.com.br',
//                     cpf: '94271564656',
//                     birth: '1977-01-15',
//                     phone_number: '5144916523',
//                 },
//             },
//         },
    
//         items: [
//             {
//                 name: 'Product 1',
//                 value: 500,
//                 amount: 1,
//             },
//         ],
//         shippings: [
//             {
//                 name: 'Default Shipping Cost',
//                 value: 100,
//             },
//         ],
//     }
//     const efipay = new EfiPay(options)

//     efipay.createOneStepCharge([], body)
// 	.then((resposta) => {
// 		console.log(resposta)
//         res.send(resposta);
// 	})
// 	.catch((error) => {
// 		console.log(error)
//         res.status(500).send({ error: 'Internal Server Error' });
//     })
// }

// module.exports = { createBoletoUnico };




const createBoletoUnico = async (data, res) => {
    const mensalidadeData = await getMensalidadeUnica(data.id);
    let urlBoleto = {}
    urlBoleto.data = mensalidadeData?.boletoUrl;
    if(mensalidadeData === null){
        console.log('entrou 1')
        res.status(500).send({ error: 'Internal Server Error' });
        return;
    }
    if(mensalidadeData?.paga){
        console.log('entrou 2')
        return res.status(400).send({ error: 'Mensalidade já paga' });
    }
    if(mensalidadeData.boletoUrl?.length > 0){
        console.log('entrou 3')
        console.log(mensalidadeData)
        res.send(urlBoleto);
        return;
    }
    else{
        console.log('entrou 4')
        const clienteData = await clientFunctions.getCliente(data.idCliente)
        console.log(data)
        let body = {
            payment: {
                banking_billet: {
                    expire_at: adicionarDias(new Date(), 5),
                    customer: {
                        name: clienteData.nome_titular,
                        email: clienteData.email,
                        cpf: clienteData.cpf,
                        birth: formatDate(clienteData.data_nasc),
                        phone_number: limparNumero(clienteData.telefone_princ),
                    },
                },
            },
        
            items: [
                {
                    name: data.abreviacao,
                    value: Number(data.valor*100),
                    amount: 1,
                },
            ],
        }
        const efipay = new EfiPay(options)
    
        efipay.createOneStepCharge([], body)
        .then((resposta) => {
            console.log(resposta)
            urlBoleto.data = resposta.data.pdf.charge;
            addBoleto(data.id, resposta.data.pdf.charge)
            res.send(urlBoleto)
        })
        .catch((error) => {
            console.log(error)
            res.status(500).send({ error: error });
        })

    }
   
}

const listenBoleto = async (data, res) => {
    console.log(data)
    const efipay = new EfiPay(options)

    efipay.listenCharge(data)
    .then((resposta) => {
        console.log(resposta)
        res.send(resposta);
    })
    .catch((error) => {
        console.log(error)
        res.status(500).send({ error: 'Internal Server Error' });
    })
}

module.exports = { createBoletoUnico };



