const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore");
const { Client, MessageMedia, LocalAuth, LegacySessionAuth, Buttons, List } = require('whatsapp-web.js');
const fs = require('fs');
const mensalidades = require('./mensalidades')
const qrcode = require('qrcode-terminal');
const async = require('async');
const { numberAleatorio } = require('../functions');
const { createPaymentLink } = require('./Asaas/LinkPagamentoAsaas');
const { getCliente } = require('./clientes');

const SESSION_FILE_PATH = './session.json';
let ws;
let sessionData;

const withSession = async () => {
    sessionData = require(SESSION_FILE_PATH);
    ws = new Client({authStrategy: new LocalAuth({ dataPath: "sessions" })});
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.initialize();
}

const withOutSession = async () => {

    ws = new Client({authStrategy: new LocalAuth({ dataPath: "sessions" })});
    ws.initialize();

    ws.on('ready', () => {
        console.log('Whatsapp está pronto!');
        return 'Whatsapp está pronto!';
    });
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.on('authenticated', (session) => {
        sessionData = session;
        console.log(sessionData)
        if (sessionData != undefined) {
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
                if (err) console.log(err);
            });
        }

    });
    // Geramos o QRCODE no Terminal
    let result;
    let qrCode = await new Promise((resolve, reject) => {
        ws.on('qr', (qr) => resolve(qr))
    }).then((qr) => {
        result = qr
    });
    return result;
}

async function logarWhatsApp() {
    if ((fs.existsSync(SESSION_FILE_PATH))) {
        await withSession();
    } else {
        const seasonReturn = await withOutSession();
        return seasonReturn;
    }
}


async function enviaCobrancaWhatsapp() {
    const data = await mensalidades.getMensalidadesVencemHoje()
    const phoneNumbers = [];
    async.timesSeries(data.length, (i, next) => {
        const element = data[i];
        let numberUser = data[i].telefonePrinc.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
        numberUser = numberUser.replace('@c.us', '');
        const isTrue = ws.isRegisteredUser(numberUser);
        if (numberUser.length < 10) {
            numberUser = "67" + numberUser;
        }
        if (numberUser.length === 11 && numberUser[2] === '9') {
            numberUser = numberUser.slice(0, 2) + numberUser.slice(3);
        }
        let shouldSend = true;
        numberUser = `55${numberUser}@c.us`
        if (phoneNumbers.includes(numberUser) || !isTrue) {
            shouldSend = false;
        }
        if (shouldSend) {
            phoneNumbers.push(numberUser);
            console.log('Enviando mensagem para:', numberUser);

            const valorOriginal = Number(element.valor || (element?.element && element.element.valor) || 0);
            const valorCorrigido = Math.round((valorOriginal + Number.EPSILON) * 100) / 100;

            let paymentUrl = '';
            getCliente(element.idCliente)
                .then((cliente) => {
                    const dataVenc = element?.element?.dataVenc;
                    let dueDate = new Date();
                    if (dataVenc && typeof dataVenc.seconds === 'number') {
                        dueDate = new Date(dataVenc.seconds * 1000);
                    } else if (dataVenc instanceof Date) {
                        dueDate = dataVenc;
                    }
                    const yyyy = dueDate.getFullYear();
                    const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(dueDate.getDate()).padStart(2, '0');

                    const paymentData = {
                        id: element?.element?.id,
                        customer: cliente?.id_asaas,
                        billingType: 'BOLETO',
                        value: valorCorrigido,
                        dueDate: `${yyyy}-${mm}-${dd}`,
                        description: `Mensalidade ${element.abreviacao}`,
                        externalReference: element?.element?.id
                    };

                    return Promise.all([
                        createPaymentLink(paymentData),
                        mensalidades.updateValue(element?.element?.id, valorCorrigido).catch(() => { })
                    ]);
                })
                .then(([payment]) => {
                    paymentUrl = (payment && (payment.invoiceUrl || payment.bankSlipUrl)) || '';

                    let nameElement = element.nome.split(' ')[0];
                    nameElement = nameElement.charAt(0).toUpperCase() + nameElement.slice(1).toLowerCase();
                    const valorFormatado = `R$ ${valorCorrigido.toFixed(2).replace('.', ',')}`;
                    let message = `Olá ${nameElement}, tudo bem? Aqui é da Pax Nippon. Estamos entrando em contato para lembrar que sua mensalidade referente a ${element.abreviacao}, no valor de ${valorFormatado}, vence hoje.\n\nPague pelo link: ${paymentUrl || 'indisponível no momento.'}`;

                    return ws.sendMessage(numberUser, message);
                })
                .then(e => {
                    console.log('Mensagem enviada com sucesso para:', numberUser);
                    phoneNumbers.push(numberUser)
                })
                .catch(error => {
                    console.log(error)
                })
                .finally(() => {
                    setTimeout(next, numberAleatorio(60000, 120000));
                });
        } else {
            return next();
        }
    }).then(() => {
        isSending = false;
    });

    // addCobranca(data);
}

async function addCobranca(data) {
    try {
        const dataContent = { ...data, id: uniKey() };
        await setDoc(doc(db, "cobrancas", dataContent.id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


module.exports = { enviaCobrancaWhatsapp, logarWhatsApp };