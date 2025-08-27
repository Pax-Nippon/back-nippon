const axios = require('axios');
const { db, storage } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore")
const { uniKey, uniKeyNumber } = require('../functions');
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

async function getContratos(idCliente) {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "contratos"),
                where('idCliente', "==", idCliente)
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

async function addContrato(data) {
    try {
        const id = uniKeyNumber(10);
        const docRef = await setDoc(doc(db, "contratos", id), { ...data, id: id });
        return id;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function updateContrato(data, id) {
    try {
        const dataContent = {...data};
        console.log(dataContent)
        await updateDoc(doc(db, "contratos", id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function updateDependente(data, id) {
    try {
        console.log(data)
        const dataContent = {...data};
        await updateDoc(doc(db, "contratos", id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function uploadContrato(id, file) {
    const storageRef = ref(storage, 'contrato-'+id+'.pdf');
    try {
        const snapshot = await uploadBytes(storageRef, file.buffer);
        const downloadURL = await getDownloadURL(storageRef);
        updateContrato({urlContrato: downloadURL}, id);
        return downloadURL;
    } catch (error) {
        console.error('Erro ao fazer o upload:', error.message);
        throw error; // Rejeita o erro para que possa ser manipulado no seu controlador de rota.
    }
}


async function uploadArquivo(data, id,file ) {
    const name = data.name + data.type;
    const storageRef = ref(storage, name + id+'.pdf');
    try {
        const snapshot = await uploadBytes(storageRef, file.buffer);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Erro ao fazer o upload:', error.message);
        throw error; // Rejeita o erro para que possa ser manipulado no seu controlador de rota.
    }
}


module.exports = { getContratos, addContrato, uploadContrato, updateDependente, updateContrato, uploadArquivo };