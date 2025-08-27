const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore")
const { uniKey } = require('../functions');
const { getCliente } = require('./clientes');
const { getContratos } = require('./contratos');
const EfiPay = require('sdk-node-apis-efi')
const options = require('./Efi/credentials')

async function getPlanos() {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "planos"),
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

async function addPlano(data) {
    try {
        let body = {
            name: data.descricao,
            repeats: null,
            interval: 1,
        }
        const efipay = await new EfiPay(options)
        efipay.createPlan({}, body)
            .then(async (resposta) => {
                const dataContent = { ...data, id: resposta.data.plan_id };
                const docRef = doc(db, "planos", dataContent.id.toString());
                try {
                    await setDoc(docRef, dataContent);
                    console.log('Documento escrito com ID:', docRef.id);
                } catch (error) {
                    console.error('Erro ao escrever documento:', error);
                }
            })
            .catch((error) => {
                console.log(error)
            })
        return true;

    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function updatePlano(data, id) {
    try {
        const dataContent = { ...data };
        await updateDoc(doc(db, "planos", id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getTodasMensalidades(idCliente) {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
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


async function UpdateUser(dataReceived) {
    try {
        const data = {
            name: dataReceived.name,
            login: dataReceived.login,
            password: dataReceived.password,
            type: dataReceived.type,
        };
        await setDoc(doc(db, "users", dataReceived.id), data);
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function pagarMensalidade(idMensalidade) {
    try {

        await updateDoc(doc(db, "mensalidades", idMensalidade), { paga: true });
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function gerarMensalidade(idCliente) {
    try {
        const contratoCliente = await getContratos(idCliente);
        if (contratoCliente.length >= 1) {
            contratoCliente.forEach(async contrato => {
                const data = {
                    idCliente: idCliente,
                    idContrato: contrato.id,
                    id: uniKeyNumber(5),
                    valor: contrato.valor,
                    paga: false,
                    data: new Date().toLocaleString('pt-BR'),
                    dataVenc: contrato.dia_vencimento + '/' + new Date().getMonth() + '/' + new Date().getFullYear(),
                };
                await setDoc(doc(db, "mensalidades", data.id), data);
            });
        }
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}



module.exports = { getPlanos, addPlano, updatePlano };