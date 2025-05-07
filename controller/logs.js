const { db } = require('../firebase');
const { doc, collection, addDoc, getDocs, query, orderBy, limit, where } = require("firebase/firestore");
const { uniKey } = require('../functions');

async function addLog(data) {
    console.log(data)
    try {
        const logData = {
            ...data,
            id: uniKey(),
            timestamp: new Date()
        };

        await addDoc(collection(db, "logs"), logData);
        return true;
    } catch (error) {
        console.error('Erro ao registrar log:', error.message);
        return null;
    }
}

async function getLogs(limit = 100) {
    try {
        const data = [];
        const querySnap = await getDocs(
            query(
                collection(db, "logs"),
                orderBy("timestamp", "desc"),
                limit(limit)
            )
        );

        querySnap.forEach((doc) => {
            data.push(doc.data());
        });

        return data;
    } catch (error) {
        console.error('Erro ao buscar logs:', error.message);
        return null;
    }
}

async function getLogsByUser(userId) {
    try {
        const data = [];
        const querySnap = await getDocs(
            query(
                collection(db, "logs"),
                where("userId", "==", userId),
                orderBy("timestamp", "desc"),
                limit(limit)
            )
        );  

        querySnap.forEach((doc) => {
            data.push(doc.data());
        });

        return data;
    } catch (error) {
        console.error('Erro ao buscar logs por usuário:', error.message);
        return null;
    }
}

module.exports = { addLog, getLogs, getLogsByUser }; 