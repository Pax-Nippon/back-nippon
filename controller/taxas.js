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
async function getTaxas() {
  try {
    const data = [];
    const querySnap = await getDocs(collection(db, "taxas"));
    querySnap.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar taxas:", error.message);
    return null;
  }
}

// Função para criar um novo departamento
async function addTaxa(dataReceived) {
  try {
    console.log(dataReceived)
    // Sempre cria uma nova taxa com ID único para evitar sobrescrita
    const dataToCreate = { ...dataReceived };
    await setDoc(doc(db, "taxas", String(dataReceived.codigo)), dataToCreate);
    console.log("Taxa criado com sucesso:");
    return dataToCreate;
  } catch (error) {
    console.error("Erro ao criar setor:", error.message);
    return null;
  }
}

// Função para atualizar um departamento existente
async function updateTaxa(dataReceived) {
  try {
    const docRef = doc(db, "taxas", dataReceived.codigo);

    await updateDoc(docRef, {
        ...dataReceived
    });

    console.log("Taxa atualizado com sucesso:");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar setor:", error.message);
    return false;
  }
}

// Função para deletar um departamento
async function deleteTaxa(id) {
  try {
    const docRef = doc(db, "taxas", id);
    await deleteDoc(docRef);
    console.log("Taxa deletado com sucesso:", id);
    return true;
  } catch (error) {
    console.error("Erro ao deletar setor:", error.message);
    return false;
  }
}

module.exports = {
  getTaxas,
  addTaxa,
  updateTaxa,
  deleteTaxa,
};
