const { db } = require('../firebase');
const { doc, collection, getDocs, query, orderBy, limit, where, setDoc } = require("firebase/firestore");
const { uniKey } = require('../functions');
const { isLogged } = require('./authentication');
const jwt = require('jsonwebtoken');

async function addLog(data) {
    const decoded = await jwt.verify(data.token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log(decoded)
    try {
        const logData = {
            ...data,
            id: uniKey(20),
            userId: userId,
            timestamp: new Date()
        };

        await setDoc(doc(collection(db, "logs"), logData.id), logData);
        return true;
    } catch (error) {
        console.error('Erro ao registrar log:', error.message);
        return null;
    }
}

async function getLogs(queryParams) {
    try {
        let logsQuery;
        
        if (queryParams?.dataInicial && queryParams?.dataFinal) {
            const dataInicial = new Date(queryParams.dataInicial);
            const dataFinal = new Date(queryParams.dataFinal);
            
            if (queryParams?.userId) {
                logsQuery = query(
                    collection(db, "logs"),
                    where("timestamp", ">=", dataInicial),
                    where("timestamp", "<=", dataFinal),
                    where("userId", "==", queryParams.userId),
                    orderBy("timestamp", "desc")
                );
            } else {
                logsQuery = query(
                    collection(db, "logs"), 
                    where("timestamp", ">=", dataInicial),
                    where("timestamp", "<=", dataFinal),
                    orderBy("timestamp", "desc")
                );
            }
        } else if (queryParams?.userId) {
            logsQuery = query(
                collection(db, "logs"),
                where("userId", "==", queryParams.userId),
                orderBy("timestamp", "desc")
            );
        } else {
            logsQuery = query(
                collection(db, "logs"),
                orderBy("timestamp", "desc")
            );
        }

        const data = [];
        const querySnap = await getDocs(logsQuery);

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
        const logsQuery = query(
            collection(db, "logs"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(100)
        );

        const querySnap = await getDocs(logsQuery);

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