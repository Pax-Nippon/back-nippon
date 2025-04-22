const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore")
const { uniKey } = require('../functions');
const { getCliente } = require('./clientes');
const { getContratos } = require('./contratos');

async function getServicos() {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "servicos"),
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function addServicos(data) {
    try {
        const dataContent = {...data, id: uniKey()};
        await setDoc(doc(db, "servicos", dataContent.id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function updateServicos(data, id) {
    try {
        const dataContent = {...data};
        await updateDoc(doc(db, "servicos", id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


module.exports = { getServicos, addServicos, updateServicos };