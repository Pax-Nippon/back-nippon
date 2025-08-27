require('dotenv').config();
const axios = require("axios");
const { db } = require("../firebase");
const jwt = require('jsonwebtoken');
const { createCustomer } = require('./Asaas/ClienteAsaas');

const {
  doc,
  getDocs,
  collection,
  setDoc,
  query,
  where,
  limit,
  getDoc,
  updateDoc,
} = require("firebase/firestore");
const { uniKey, uniKeyNumber } = require("../functions");

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
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function getClienteByCpf(cpf) {
  try {
    console.log(cpf)
    const querySnapshot = await getDocs(query(collection(db, "clientes"), where("cpf", "==", cpf)));
    return querySnapshot.docs[0].data();
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function loginCliente({ usuario, senha }) {
  try {
    if (!usuario || !senha) {
      throw new Error("Usuário e senha são obrigatórios");
    }

    if (usuario !== senha) {
      throw new Error("Usuário e senha devem ser iguais");
    }

    const clienteRef = collection(db, "clientes");

    const q = query(
      clienteRef,
      where("cpf", "==", usuario)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const user = querySnapshot.docs[0];
    const data = user.data();
    
    const token = jwt.sign(
      { userId: user.id, permission: data.type || 'user' },
      process.env.JWT_SECRET || 'chave_secreta_padrao',
      { expiresIn: "24h" }
    );
    
    return { token, data };
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    throw error;
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
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}
async function getClientesForCobranca(login, senha) {
  try {
    const usersRef = collection(db, "clientes");
    const q = query(
      usersRef,
      where("contratos", "==", login),
      where("password", "==", senha)
    );
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    console.error("Erro ao buscar clientes para cobrança:", error.message);
    return [];
  }
}

async function AddCliente(dataReceived) {
  let dataAux = dataReceived;
  dataAux.nome_titular = dataAux.nome_titular?.toUpperCase();
  dataAux.id = dataAux.id || uniKeyNumber(10);
  dataAux.endereco = {
    cep: dataReceived.cep || "",
    cidade: dataReceived.cidade || "",
    estado: dataReceived.estado || "",
    endereco: dataReceived.endereco || "",
    bairro: dataReceived.bairro || "",
    number_end: dataReceived.number_end || "",
    complemento: dataReceived.complemento || "",
  };
  if (dataReceived.endereco_cobranca) {
    dataAux.endereco_cobranca = {
      cep: dataReceived.endereco_cobranca.cep || "",
      cidade: dataReceived.endereco_cobranca.cidade || "",
      estado: dataReceived.endereco_cobranca.estado || "",
      endereco: dataReceived.endereco_cobranca.endereco || "",
      bairro: dataReceived.endereco_cobranca.bairro || "",
      number_end: dataReceived.endereco_cobranca.number_end || "",
      complemento: dataReceived.endereco_cobranca.complemento || "",
      tipo_residencia: dataReceived.endereco_cobranca.tipo_residencia || "",
      numero_apartamento: dataReceived.endereco_cobranca.numero_apartamento || "",
      bloco: dataReceived.endereco_cobranca.bloco || ""
    };
  }
  try {
    const data = await createCustomer(dataAux, dataAux.id);
    dataAux.id_asaas = data.id;
    await setDoc(doc(db, "clientes", dataAux.id), dataAux);
    return dataAux;
  } catch (error) {
    console.log('Erro completo:', error);
    console.error("Erro ao fazer a requisição:", error.message);
    console.error("Stack trace:", error.stack);
    return null;
  }
}

async function UpdateCliente(dataReceived) {
  console.log(dataReceived);
  try {
    let dataAux = dataReceived;

    dataAux.nome_titular = dataAux.nome_titular?.toUpperCase();
    dataAux.endereco = {
      cep: dataReceived.cep || "",
      cidade: dataReceived.cidade || "",
      estado: dataReceived.estado || "",
      endereco: dataReceived.endereco || "",
      bairro: dataReceived.bairro || "",
      number_end: dataReceived.number_end || "",
      complemento: dataReceived.complemento || "",
    }
    if (dataReceived.endereco_cobranca) {
      dataAux.endereco_cobranca = {
        cep: dataReceived.endereco_cobranca.cep || "",
        cidade: dataReceived.endereco_cobranca.cidade || "",
        estado: dataReceived.endereco_cobranca.estado || "",
        endereco: dataReceived.endereco_cobranca.endereco || "",
        bairro: dataReceived.endereco_cobranca.bairro || "",
        number_end: dataReceived.endereco_cobranca.number_end || "",
        complemento: dataReceived.endereco_cobranca.complemento || "",
        tipo_residencia: dataReceived.endereco_cobranca.tipo_residencia || "",
        numero_apartamento: dataReceived.endereco_cobranca.numero_apartamento || "",
        bloco: dataReceived.endereco_cobranca.bloco || ""
      };
    }
    await setDoc(doc(db, "clientes", dataAux.id), dataAux);
    return dataAux;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function UpdateClienteArquivo(dataReceived, id) {
  try {
    const dataContent = { arquivos: [...dataReceived] };
    console.log(dataReceived);
    console.log(dataContent);
    const data = await updateDoc(doc(db, "clientes", id), dataContent);
    return data;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}
async function verificarCpf(cpf) {
    try {
        // Validação para garantir que o CPF foi recebido
        if (!cpf) {
            throw new Error("O parâmetro 'cpf' é obrigatório");
        }

        const clienteRef = collection(db, "clientes");
        const q = query(clienteRef, where("cpf", "==", cpf));
        const querySnapshot = await getDocs(q);

        // Verifica se o cliente existe
        if (!querySnapshot.empty) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Erro ao verificar CPF:", error.message);
        throw new Error("Erro ao verificar CPF");
    }
}

module.exports = {
  getClientes,
  getCliente,
  AddCliente,
  UpdateCliente,
  UpdateClienteArquivo,
  loginCliente,
  verificarCpf,
  getClientesForCobranca,
  getClienteByCpf
};
