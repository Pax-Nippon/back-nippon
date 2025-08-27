const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, deleteDoc, query, where} = require("firebase/firestore")
const {uniKeyNumber} = require('../functions');


async function loginUsuarioAplicativo(user) {
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, "usuarioAplicativo"), 
                where('email', "==", user.email),
                where('password', "==", user.senha)
            )
        );
        return querySnapshot.docs[0].data() || null;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}
async function getUsuarioAplicativo(id) {
    try {
        const querySnapshot = await getDoc(doc(db, "usuarioAplicativo", id));
        return querySnapshot.data();
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function AddUsuarioAplicativo(dataReceived) {
    try {
        const data = {...dataReceived, id: uniKeyNumber(5)};
        await setDoc(doc(db, "usuarioAplicativo", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function UpdateUsuarioAplicativo(dataReceived, id) {
    try {
        await setDoc(doc(db, "usuarioAplicativo", id), dataReceived);
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function getUsuarioAplicativoType(type) {
    try {
        const data = [];
        const querySnap = await getDocs(
            query(
                collection(db, "usuarioAplicativo"), 
                where('type', "==", Number(type))
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


async function DeleteUsuarioAplicativo(id) {
    try {
        const res = deleteDoc(doc(db, "usuarioAplicativo", id));
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

module.exports = { getUsuarioAplicativo, getUsuarioAplicativoType, AddUsuarioAplicativo, UpdateUsuarioAplicativo, DeleteUsuarioAplicativo, loginUsuarioAplicativo };