const axios = require('axios');
const nodemailer = require("nodemailer");
require('dotenv/config');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore");
const { uniKey, typeReturn } = require('../functions');
const { getCliente } = require('./clientes');
const { getContratos } = require('./contratos');

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const mensalidadeVencidaFunc = (data) => {
    const dataAtual = new Date();
    const dataComparar = new Date(data);
    let retorno = dataAtual > dataComparar ? true : false;
    return retorno;
};

async function sendSmsMessage(data) {
    const numeroClientePrinc = "+55" + data.telefone_princ.replace(/\D/g, '');
    const numeroClienteAlternativo = "+55" +  data.telefone_alt.replace(/\D/g, '');
    const numbers = [];
    if(numeroClientePrinc===numeroClienteAlternativo){
        numbers.push(numeroClientePrinc);
    }else{
        numbers.push(numeroClientePrinc);
        numbers.push(numeroClienteAlternativo);
    }
   
    // Use Promise.all para enviar todas as mensagens SMS em paralelo
    const smsPromises = numbers.map(async (number) => {
        const message = await client.messages.create({
            body: 'A sua Mensalidade da Pax Nippon Vence Hoje, esteja em dias para usufruir dos benefícios do seu plano.',
            from: process.env.MY_NUMBER,
            to: number,
        });
        return message;
    });
    // Aguarde o envio de todas as mensagens SMS
    const result = await Promise.all(smsPromises);
    // Aguarde a gravação dos dados no banco de dados
    return true;
}

async function enviaCobrancaEmail(idCliente) {
    try {
        const cliente = await getCliente(idCliente);
        const mensalidades = await getMensalidadesAtrasadas(idCliente);
        const contratos = await getContratos(idCliente);
        console.log(cliente, mensalidades, contratos)
        const transporter = nodemailer.createTransport({
            host: process.env.HOST_EMAIL,
            port: process.env.HOST_EMAIL_PORT,
            pool: true,
            secure: true,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASSWORD_EMAIL,
            }
        });
        const mailSent = await transporter.sendMail({
            text: `Olá ${cliente.nome_titular}, você possui ${mensalidades.length} mensalidades atrasadas, totalizando R$ ${mensalidades.reduce((acc, cur) => acc + cur.valor, 0)}.
            `,
            subject: `Cobrança mensalidade`,
            from: process.env.USER_EMAIL,
            to: 'guipecoisarakaki@gmail.com',
        });
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function cobrancaEmail() {
    // Divide a string da data em dia, mês e ano
    const dataExample = '07/11/2023 ';
    const data = dataExample.split(' ')[0];
    const partes = data.split('/');
    const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]} 23:59:59`;
    const mensalidadeVencida = mensalidadeVencidaFunc(dataFormatada);
    if (mensalidadeVencida) {
        try {
            await enviaCobrancaEmail('R16zxoVFLwSNdpwVvvh19q4wk')
        } catch (error) {
            console.error(`Error while sending email: ${error}`);
        }
    }
    return true;
}

async function enviaCobrancaWhatsapp(idCliente) {
    console.log(idCliente)
}

async function cobrancaSmsDiaria(dataReceived) {
    const result = dataReceived.map(async (data) => {
        const dataCliente = await getCliente(data.idCliente);
        const result = await sendSmsMessage(dataCliente);
    });
    return result;
}

async function cobrancaSms3Dias(dataReceived) {
    const result = dataReceived.map(async (data) => {
        const dataCliente = await getCliente(data.idCliente);
        const result = await sendSmsMessage(dataCliente);
    });
    return result;
}


async function getMensalidadesAtrasadas(idCliente) {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('idCliente', "==", idCliente),
                where('paga', "==", false)
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
                for (let aux = new Date().getMonth() + 1; aux <= 12; aux++) {
                    let valorTotal;
                    if (contrato.tipoValor === 1) {
                        valorTotal = contrato.salarioMinimo * (contrato.valorPorcentagemPlano / 100);
                    } else {
                        valorTotal = contrato.valorFixoPlano;
                    }
                    const data = {
                        idCliente: idCliente,
                        idContrato: contrato.id,
                        id: uniKey(30),
                        valor: valorTotal,
                        paga: false,
                        data: new Date().toLocaleString('pt-BR'),
                        dataVenc: contrato.dia_vencimento + '/' + aux + '/' + new Date().getFullYear(),
                    };
                    await setDoc(doc(db, "mensalidades", data.id), data);
                }

            });
        }
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}





module.exports = { cobrancaEmail, cobrancaSmsDiaria,cobrancaSms3Dias, pagarMensalidade, gerarMensalidade };