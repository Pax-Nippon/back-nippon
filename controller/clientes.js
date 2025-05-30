const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, limit, getDoc, updateDoc } = require("firebase/firestore")
const { uniKey } = require('../functions');

async function getCliente(id) {
    try {
        const docRef = doc(db, "clientes", id);
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


async function getClientes() {
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
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
async function getClientesForCobranca() {
    const usersRef = collection(db, "clientes");
    const q = query(usersRef, where("contratos", "==", login), where("password", "==", senha));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
        data.push(doc.data());
    });
    return data;
}

async function AddCliente(dataReceived) {
    try {
        const data = {
            nome_titular: dataReceived.nome_titular?.toUpperCase() || '',
            sexo: dataReceived.sexo || '',
            estado_civil: dataReceived.estado_civil || '',
            cpf: dataReceived.cpf || '',
            rg: dataReceived.rg || '',
            uf: dataReceived.uf || '',
            email: dataReceived.email || '',
            telefone_princ: dataReceived.telefone_princ || '',
            telefone_alt: dataReceived.telefone_alt || '',
            data_nasc: dataReceived.data_nasc || '',
            profissao: dataReceived.profissao || '',
            religiao: dataReceived.religiao || '',
            endereco: {
                cep: dataReceived.cep || '',
                cidade: dataReceived.cidade || '',
                estado: dataReceived.estado || '',
                endereco: dataReceived.endereco || '',
                bairro: dataReceived.bairro || '',
                number_end: dataReceived.number_end || '',
                tipo_residencia: dataReceived.tipo_residencia || '',
                bloco: dataReceived.bloco || '',
                numero_apartamento: dataReceived.numero_apartamento || '',
            },
            pais: {
                mae: {
                    nome: dataReceived?.pais?.mae?.nome || '',
                    viva: dataReceived?.pais?.mae?.viva ?? null,
                },
                pai: {
                    nome: dataReceived?.pais?.pai?.nome || '',
                    vivo: dataReceived?.pais?.pai?.vivo ?? null,
                }
            },
            local_trabalho: dataReceived.local_trabalho || '',
            telefone_trabalho: dataReceived.telefone_trabalho || '',
            matricula_cassems: dataReceived.matricula_cassems || '', // <-- Adicionado
            setor_trabalho: dataReceived.setor_trabalho || '',       // <-- Adicionado
            endereco_cobranca: {
                cep: dataReceived?.endereco_cobranca?.cep || '',
                cidade: dataReceived?.endereco_cobranca?.cidade || '',
                estado: dataReceived?.endereco_cobranca?.estado || '',
                bairro: dataReceived?.endereco_cobranca?.bairro || '',
                endereco: dataReceived?.endereco_cobranca?.endereco || '',
                number_end: dataReceived?.endereco_cobranca?.number_end || '',
                tipo_residencia: dataReceived?.endereco_cobranca?.tipo_residencia || '',
                bloco: dataReceived?.endereco_cobranca?.bloco || '',
                numero_apartamento: dataReceived?.endereco_cobranca?.numero_apartamento || '',
            },
            id: uniKey(25)
        };
        await setDoc(doc(db, "clientes", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function UpdateCliente(dataReceived) {
    console.log(dataReceived)
    try {
        const data = {
            nome_titular: dataReceived.nome_titular.toUpperCase(),
            contrato: dataReceived.contrato ? dataReceived.contrato : [],
            endereco: {
                cep: dataReceived?.cep,
                estado: dataReceived?.estado,
                cidade: dataReceived?.cidade,
                bairro: dataReceived?.bairro,
                endereco: dataReceived?.endereco,
                number_end: dataReceived?.number_end,
            },
            endereco_cobranca: {
                cep: dataReceived?.endereco_cobranca?.cep,
                estado: dataReceived?.endereco_cobranca?.estado,
                cidade: dataReceived?.endereco_cobranca?.cidade,
                bairro: dataReceived?.endereco_cobranca?.bairro,
                endereco: dataReceived?.endereco_cobranca?.endereco,
                number_end: dataReceived?.endereco_cobranca?.number_end,
            },
            pais: {
                mae: {
                    nome: dataReceived?.pais?.mae?.nome,
                    viva: dataReceived?.pais?.mae?.viva,
                },
                pai: {
                    nome: dataReceived?.pais?.pai?.nome,
                    vivo: dataReceived?.pais?.pai?.vivo,
                }
            },
            local_trabalho: dataReceived?.local_trabalho,
            telefone_trabalho: dataReceived?.telefone_trabalho,
            cpf: dataReceived.cpf,
            rg: dataReceived.rg,
            uf: dataReceived.uf,
            email: dataReceived.email,
            telefone_princ: dataReceived.telefone_princ,
            telefone_alt: dataReceived?.telefone_alt ? dataReceived.telefone_alt : '',
            data_nasc: dataReceived.data_nasc,
            profissao: dataReceived?.profissao ? dataReceived.profissao : '',
            religiao: dataReceived?.religiao ? dataReceived.religiao : '',
            observacoes: dataReceived?.observacoes ? dataReceived.observacoes : '',
            sexo: dataReceived?.sexo,
            id: dataReceived.id
        };
        await setDoc(doc(db, "clientes", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function UpdateClienteArquivo(dataReceived, id) {
    try {
        const dataContent = {'arquivos':[...dataReceived]};
        console.log(dataReceived)
        console.log(dataContent)
        const data = await updateDoc(doc(db, "clientes", id), dataContent);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


module.exports = { getClientes, getCliente, AddCliente, UpdateCliente, UpdateClienteArquivo};