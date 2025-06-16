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
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar setores:", error.message);
    return null;
  }
}

// Função para criar um novo departamento
async function addSetores(dataReceived) {
  try {
    console.log(dataReceived)
    await setDoc(doc(db, "setores", String(dataReceived.id)), dataReceived);
    console.log("Setor criado com sucesso:");
    return dataReceived;
  } catch (error) {
    console.error("Erro ao criar setor:", error.message);
    return null;
  }
}

// Função para atualizar um departamento existente
async function updateSetores(dataReceived) {
  try {
    const docRef = doc(db, "setores", dataReceived.id);

    await updateDoc(docRef, {
        ...dataReceived
    });

    console.log("Setor atualizado com sucesso:");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar setor:", error.message);
    return false;
  }
}

// Função para deletar um departamento
async function deleteSetores(id) {
  try {
    const docRef = doc(db, "setores", id);
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
