const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')
const {diaAmanhaString} = require('../../functions')



const criarAssinatura = async (data) => {
    let planBody = {
        name: 'My first plan',
        repeats: 24,
        interval: 2,
    }

    let subscriptionBody = {
        items: [
            {
                name: 'Product 1',
                value: 1000,
                amount: 2,
            },
        ],
    }
    const efipay = new EfiPay(options)


    efipay.createPlan({}, planBody)
        .then(createSubscription)
        .then((resposta) => {
            console.log(resposta);
            return resposta;

        })
        .catch((error) => {
            console.log(error)
        })

}


const pegaMaiorValor = (data) => {
    let maior = 0;
    data.forEach((element) => {
        if (element.valor > maior) {
            maior = element.idPlano;
        }
    });
    return maior;
}


const criarLinkAssinatura = async (data) => {
    console.log(data)
    let maiorValor = pegaMaiorValor(data.carnes);
    let params = {
        id: maiorValor,
    }
    let body = {
        items: [],
        settings: {
            payment_method: 'credit_card',
            expire_at: diaAmanhaString(),// 1 day from now
            // expire_at: '2024-05-10',
            request_delivery_address: false,
        },
    }

    data.carnes.forEach((element) => {
        body.items.push({
            name: element.abreviacao,
            value: element.valor * 100,
            amount: 1,
        })
    });

    console.log(body)
    const efipay = new EfiPay(options)

    efipay.oneStepSubscriptionLink(params, body).then((resposta) => {
        console.log(resposta)
        return resposta.data.payment_url;
    }).catch((error) => {
        console.log(error)
    })

}


module.exports = { criarAssinatura, criarLinkAssinatura };
