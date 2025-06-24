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
  console.log(dataReceived);
  try {
    const data = {
      nome_titular: dataReceived.nome_titular?.toUpperCase() || "",
      sexo: dataReceived.sexo || "",
      estado_civil: dataReceived.estado_civil || "",
      cpf: dataReceived.cpf || "",
      rg: dataReceived.rg || "",
      uf: dataReceived.uf || "",
      email: dataReceived.email || "",
      telefone_princ: dataReceived.telefone_princ || "",
      telefone_alt: dataReceived.telefone_alt || "",
      data_nasc: dataReceived.data_nasc || "",
      profissao: dataReceived.profissao || "",
      religiao: dataReceived.religiao || "",
      endereco: {
        cep: dataReceived.cep || "",
        cidade: dataReceived.cidade || "",
        estado: dataReceived.estado || "",
        endereco: dataReceived.endereco || "",
        bairro: dataReceived.bairro || "",
        number_end: dataReceived.number_end || "",
        tipo_residencia: dataReceived.tipo_residencia || "",
        bloco: dataReceived.bloco || "",
        numero_apartamento: dataReceived.numero_apartamento || "",
      },
      pais: {
        mae: {
          nome: dataReceived?.pais?.mae?.nome || "",
          viva: dataReceived?.pais?.mae?.viva ?? null,
        },
        pai: {
          nome: dataReceived?.pais?.pai?.nome || "",
          vivo: dataReceived?.pais?.pai?.vivo ?? null,
        },
      },
      local_trabalho: dataReceived.local_trabalho || "",
      telefone_trabalho: dataReceived.telefone_trabalho || "",
      matricula_cassems: dataReceived.matricula_cassems || "",
      setor_trabalho: dataReceived.setor_trabalho || "",
      endereco_cobranca: {
        cep: dataReceived?.endereco_cobranca?.cep || "",
        cidade: dataReceived?.endereco_cobranca?.cidade || "",
        estado: dataReceived?.endereco_cobranca?.estado || "",
        bairro: dataReceived?.endereco_cobranca?.bairro || "",
        endereco: dataReceived?.endereco_cobranca?.endereco || "",
        number_end: dataReceived?.endereco_cobranca?.number_end || "",
        tipo_residencia: dataReceived?.endereco_cobranca?.tipo_residencia || "",
        bloco: dataReceived?.endereco_cobranca?.bloco || "",
        numero_apartamento:
          dataReceived?.endereco_cobranca?.numero_apartamento || "",
      },
      id: uniKey(10),
      idAsaas: "",
      estado_civil: dataReceived.estado_civil || ""
    };

    // Create customer in Asaas
    const asaasCustomerData = {
      name: data.nome_titular,
      cpfCnpj: data.cpf,
      email: data.email,
      phone: data.telefone_princ,
      mobilePhone: data.telefone_alt,
      address: data.endereco.endereco,
      addressNumber: data.endereco.number_end,
      complement: data.endereco.bloco,
      province: data.endereco.bairro,
      postalCode: data.endereco.cep,
      city: data.endereco.cidade,
      state: data.endereco.estado
    };

    const asaasResponse = await createCustomer(asaasCustomerData, data.id);
    data.idAsaas = asaasResponse.id;

    await setDoc(doc(db, "clientes", data.id), data);
    return data;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function UpdateCliente(dataReceived) {
  console.log(dataReceived);
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
        },
      },
      local_trabalho: dataReceived?.local_trabalho,
      telefone_trabalho: dataReceived?.telefone_trabalho,
      cpf: dataReceived.cpf,
      rg: dataReceived.rg,
      uf: dataReceived.uf,
      email: dataReceived.email,
      telefone_princ: dataReceived.telefone_princ,
      telefone_alt: dataReceived?.telefone_alt ? dataReceived.telefone_alt : "",
      data_nasc: dataReceived.data_nasc,
      matricula_cassems: dataReceived?.matricula_cassems ? dataReceived.matricula_cassems : "",
      setor_trabalho: dataReceived?.setor_trabalho ? dataReceived.setor_trabalho : "",
      idAsaas: dataReceived?.idAsaas ? dataReceived.idAsaas : "",
      estado_civil: dataReceived?.estado_civil ? dataReceived.estado_civil : "",
      profissao: dataReceived?.profissao ? dataReceived.profissao : "",
      religiao: dataReceived?.religiao ? dataReceived.religiao : "",
      observacoes: dataReceived?.observacoes ? dataReceived.observacoes : "",
      sexo: dataReceived?.sexo,
      id: dataReceived.id,
    };
    await setDoc(doc(db, "clientes", data.id), data);
    return data;
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
