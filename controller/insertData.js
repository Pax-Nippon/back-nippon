const axios = require('axios');
const { db } = require('../firebase');
const { setDoc, doc } = require("firebase/firestore");
const { uniKey, typeReturn } = require('../functions');
require('dotenv').config()


const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const myNumber = process.env.MY_NUMBER;

async function sendSmsMessage(dataReceived) {
    const numbers = [
        '+5567981566794',
        '+5567981566794',
    ];
    const body = await typeReturn(dataReceived.type);
    // Use Promise.all para enviar todas as mensagens SMS em paralelo
    const smsPromises = numbers.map(async (number) => {
        const message = await client.messages.create({
            body: body,
            from: myNumber,
            to: number,
        });
        return message;
    });
    // Aguarde o envio de todas as mensagens SMS
    await Promise.all(smsPromises);
    // Aguarde a gravação dos dados no banco de dados
    const data = {
        titulo: dataReceived.titulo,
        departamento: dataReceived.departamento,
        mensagem: body,
        numbers: numbers,
        type: dataReceived.type,
        date: new Date().toLocaleString('pt-BR'),
        id: uniKey()
    };
    await setDoc(doc(db, "disparoSms",data.id), data);
    return data;
}

async function sendWhatsTwilio() {
    client.messages
        .create({
            from: 'whatsapp:' + myNumber,
            body: 'Hello there!',
            to: 'whatsapp:' + '+5567981566794'
        })
        .then(message => console.log(message.sid));
}


async function sendDisparoFirebase(data) {
}



module.exports = { sendDisparoFirebase, sendSmsMessage, sendWhatsTwilio };