const axios = require("axios");
const { db, storage } = require("../firebase");
const {
  doc,
  getDocs,
  collection,
  setDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  getDoc,
} = require("firebase/firestore");
const { uniKey } = require("../functions");


// Função para listar todos os departamentos
async function getSetores() {
  try {
    const data = [];
    const querySnap = await getDocs(collection(db, "setores"));
    querySnap.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() }); // Inclui todos os campos
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar setores:", error.message);
    return null;
  }
}

// Função para criar um novo departamento
async function addSetores({ codigo, descricao, cobrador, comissao }) {
  try {
    const id = uniKey(20); // Gera um ID único de 20 caracteres

    await setDoc(doc(db, "setores", id), {
      id: id,
      codigo: codigo,
      descricao: descricao,
      cobrador: cobrador,
      comissao: comissao,
    });

    console.log("Setor criado com sucesso:", { id, codigo, descricao, cobrador, comissao });
    return { id };
  } catch (error) {
    console.error("Erro ao criar setor:", error.message);
    return null;
  }
}

// Função para atualizar um departamento existente
async function updateSetores(id, { codigo, descricao, cobrador, comissao }) {
  try {
    const docRef = doc(db, "setores", id);

    await updateDoc(docRef, {
        codigo: codigo,
        descricao: descricao,
        cobrador: cobrador,
        comissao: comissao,
    });

    console.log("Setor atualizado com sucesso:", { id, codigo, descricao, cobrador, comissao });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar setor:", error.message);
    return false;
  }
}

// Função para deletar um departamento
async function deleteSetores(id) {
  try {
    const docRef = doc(db, "setor", id);
    await deleteDoc(docRef);
    console.log("Setor deletado com sucesso:", id);
    return true;
  } catch (error) {
    console.error("Erro ao deletar setor:", error.message);
    return false;
  }
}

module.exports = {
  getSetores,
  addSetores,
  updateSetores,
  deleteSetores,
};
