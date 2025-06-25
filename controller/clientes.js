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
const { uniKey } = require("../functions");

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
      where("cpf", "==", usuario),
      where("cpf", "==", senha)
    );
    try {
      const querySnapshot = await getDocs(q);
      const user = querySnapshot.docs[0];
      const data = user.data();
      if (user) {
        const token = jwt.sign(
          { userId: user.id, permission: data.type },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        return { token, data };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting documents: ", error);
      return null;
    }

    const cliente = querySnap.docs[0].data();
    return cliente;
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
async function getClientesForCobranca() {
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
}

async function AddCliente(dataReceived) {
  let dataAux = dataReceived;

  dataAux.nome_titular = dataAux.nome_titular?.toUpperCase();
  dataAux.id = dataAux.id || uniKey();
  dataAux.endereco = {
    cep: dataReceived.cep || "",
    cidade: dataReceived.cidade || "",
    estado: dataReceived.estado || "",
    endereco: dataReceived.endereco || "",
    bairro: dataReceived.bairro || "",
    number_end: dataReceived.number_end || "",
    complemento: dataReceived.complemento || "",
  }
  dataAux?.endereco_cobranca && (dataAux.endereco_cobranca = {
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
  })
  try {
  
    // Create customer in Asaas
    const asaasCustomerData = {
      name: dataAux?.nome_titular,
      cpfCnpj: dataAux?.cpf,
      email: dataAux?.email,
      phone: dataAux?.telefone_princ,
      mobilePhone: dataAux?.telefone_princ,
    };
    console.log(asaasCustomerData);
    const asaasResponse = await createCustomer(asaasCustomerData, dataAux.id);
    dataAux.idAsaas = asaasResponse.id;
    console.log('foi');
    await setDoc(doc(db, "clientes", dataAux.id), dataAux);
    return dataAux;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
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
    dataAux?.endereco_cobranca && (dataAux.endereco_cobranca = {
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
    })
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

module.exports = {
  getClientes,
  getCliente,
  AddCliente,
  UpdateCliente,
  UpdateClienteArquivo,
  loginCliente,
};
