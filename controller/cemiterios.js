const axios = require("axios");
const { db } = require("../firebase");
const {
  doc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");
const { uniKey } = require("../functions");

// Função para listar todos os cemitérios
async function getCemiterios() {
  try {
    const data = [];
    const querySnap = await getDocs(collection(db, "cemiterios"));
    querySnap.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() }); // Inclui todos os campos
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar cemitérios:", error.message);
    return null;
  }
}

// Função para criar um novo cemitério
async function addCemiterios({ codigo, nome, cep, endereco, bairro, numero }) {
  try {
    const id = uniKey(20); // Gera um ID único de 20 caracteres

    await setDoc(doc(db, "cemiterios", id), {
      id: id,
      codigo: codigo,
      nome: nome,
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      numero: numero,
    });

    console.log("Cemitério criado com sucesso:", {
      id,
      codigo,
      nome,
      cep,
      endereco,
      bairro,
      numero,
    });
    return { id };
  } catch (error) {
    console.error("Erro ao criar cemitério:", error.message);
    return null;
  }
}

// Função para atualizar um cemitério existente
async function updateCemiterios(
  id,
  { codigo, nome, cep, endereco, bairro, numero }
) {
  try {
    const docRef = doc(db, "cemiterios", id);

    await updateDoc(docRef, {
      codigo: codigo,
      nome: nome,
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      numero: numero,
    });

    console.log("Cemitério atualizado com sucesso:", {
      id,
      codigo,
      nome,
      cep,
      endereco,
      bairro,
      numero,
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar cemitério:", error.message);
    return false;
  }
}

// Função para deletar um cemitério
async function deleteCemiterios(id) {
  try {
    const docRef = doc(db, "cemiterios", id);
    await deleteDoc(docRef);
    console.log("Cemitério deletado com sucesso:", id);
    return true;
  } catch (error) {
    console.error("Erro ao deletar cemitério:", error.message);
    return false;
  }
}

module.exports = {
  getCemiterios,
  addCemiterios,
  updateCemiterios,
  deleteCemiterios,
};
