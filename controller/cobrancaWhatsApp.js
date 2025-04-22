const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore");
const { Client, MessageMedia, LocalAuth, LegacySessionAuth, Buttons, List } = require('whatsapp-web.js');
const fs = require('fs');
const mensalidades = require('./mensalidades')
const qrcode = require('qrcode-terminal');
const async = require('async');
const {numberAleatorio} = require('../functions');

const SESSION_FILE_PATH = './session.json';
let ws;
let sessionData;

const withSession = async () => {
    sessionData = require(SESSION_FILE_PATH);
    ws = new Client({ authStrategy: new LocalAuth({ dataPath: "sessions", }), webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', } });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.initialize();
}

const withOutSession = async () => {

    ws = new Client({
        puppeteer: {
            executablePath: '/usr/bin/brave-browser-stable',
            args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
        authStrategy: new LocalAuth({ dataPath: "sessions", }), webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', },
        puppeteer: {
            headless: true,
        },
    });
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
        const isTrue =  ws.isRegisteredUser(numberUser);
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
            let nameElement = element.nome.split(' ')[0];
            nameElement = nameElement.charAt(0).toUpperCase() + nameElement.slice(1).toLowerCase();
            let message = `Olá ${nameElement}, tudo bem? Aqui é da Pax Nippon. Estamos entrando em contato para lembrar que sua mensalidade referente a ${element.abreviacao}, no valor de R$ ${element.valor}, vence hoje.
            
            Você pode realizar o pagamento via Pix. O nosso Pix é 41220924000180.`
            ws.sendMessage(numberUser, message).then(e => {
                console.log('Mensagem enviada com sucesso para:', numberUser);
                phoneNumbers.push(numberUser)
                // dataTable.push({
                //     name: element.nome,
                //     numero: element.telefonePrinc,
                //     email: element.email,
                //     enviou: 'Sim'
                // })
                // createFile(dataTable)

            }).catch(error => {
                // dataTable.push({
                //     name: element.nome,
                //     numero: element.telefonePrinc,
                //     email: element.email,
                //     enviou: 'Não'
                // })
                // console.log(element.name, element.number)
                // createFile(dataTable)
                console.log(error)
            });
        } else {
            return next();
        }
        setTimeout(next, numberAleatorio(60000, 120000));
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