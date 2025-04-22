const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, limit, getDoc  } = require("firebase/firestore")
const { uniKey } = require('../functions');



async function setConfigComponents(dataReceived) {
    try {
        const docRef = doc(db, "configuracoes", "config");
        await setDoc(docRef, dataReceived);
        return dataReceived;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}
async function getConfigComponents() {
    try {
        const docRef = doc(db, "configuracoes", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

module.exports = {  setConfigComponents, getConfigComponents };