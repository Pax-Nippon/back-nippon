const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, deleteDoc, query, where} = require("firebase/firestore")
const {uniKey} = require('../functions');


async function getUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function AddUser(dataReceived) {
    try {
        const data = {
            name: dataReceived.name,
            login: dataReceived.login,
            password:  dataReceived.password,
            type: dataReceived.type,
            id: uniKey()
        };
        await setDoc(doc(db, "users", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function UpdateUser(dataReceived) {
    try {
        const data = {
            name: dataReceived.name,
            login: dataReceived.login,
            password:  dataReceived.password,
            type: dataReceived.type,
            id: dataReceived.id
        };
        await setDoc(doc(db, "users", dataReceived.id), data);
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function getUsersType(type) {
    try {
        const data = [];
        const querySnap = await getDocs(
            query(
                collection(db, "users"), 
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


async function DeleteUser(id) {
    try {
        const res = deleteDoc(doc(db, "users", id));
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

module.exports = { getUsers, getUsersType, AddUser, UpdateUser, DeleteUser };