const axios = require('axios');
const { db } = require('../firebase');
const { setDoc, doc } = require("firebase/firestore");
const { uniKey, typeReturn } = require('../functions');
require('dotenv').config()


async function addClient(dataReceived) {
    const data = {
        nome: dataReceived.titulo,
        departamento: dataReceived.departamento,
        mensagem: body,
        numbers: numbers,
        type: dataReceived.type,
        date: new Date().toLocaleString('pt-BR'),
    };
    await setDoc(doc(db, "disparoSms",uniKey()), data);
    return data;
}

module.exports = { addClient};
