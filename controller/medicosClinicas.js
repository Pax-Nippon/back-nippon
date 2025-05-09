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


// Função para listar todos os médicos e clínicas
async function getMedicosClinicas() {
  try {
    const data = [];
    const querySnap = await getDocs(collection(db, "medicosClinicas"));
    querySnap.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() }); // Inclui todos os campos
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar médicos e clínicas:", error.message);
    return null;
  }
}

// Função para criar um novo médico ou clínica
async function addMedicosClinicas({ codigo, descricao }) {
  try {
    const id = uniKey(20); // Gera um ID único de 20 caracteres

    await setDoc(doc(db, "medicosClinicas", id), {
      id: id,
      codigo: codigo,
      descricao: descricao,
    });

    console.log("Médico ou clínica criado com sucesso:", { id, codigo, descricao });
    return { id };
  } catch (error) {
    console.error("Erro ao criar médico ou clínica:", error.message);
    return null;
  }
}

// Função para atualizar um médico ou clínica existente
async function updateMedicosClinicas(id, { codigo, descricao }) {
  try {
    const docRef = doc(db, "medicosClinicas", id);

    await updateDoc(docRef, {
      codigo: codigo,
      descricao: descricao,
    });

    console.log("Médico ou clínica atualizado com sucesso:", { id, codigo, descricao });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar médico ou clínica:", error.message);
    return false;
  }
}

// Função para deletar um médico ou clínica
async function deleteMedicosClinicas(id) {
  try {
    const docRef = doc(db, "medicosClinicas", id);
    await deleteDoc(docRef);
    console.log("Médico ou clínica deletado com sucesso:", id);
    return true;
  } catch (error) {
    console.error("Erro ao deletar médico ou clínica:", error.message);
    return false;
  }
}

module.exports = {
  getMedicosClinicas,
  addMedicosClinicas,
  updateMedicosClinicas,
  deleteMedicosClinicas,
};
