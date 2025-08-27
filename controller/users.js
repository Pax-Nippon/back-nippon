const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, deleteDoc, query, where} = require("firebase/firestore")
const {uniKeyNumber} = require('../functions');



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
        const data = {...dataReceived, id: uniKeyNumber(5)};
        await setDoc(doc(db, "users", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function UpdateUser(dataReceived) {
    try {
        await setDoc(doc(db, "users", dataReceived.id), dataReceived);
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