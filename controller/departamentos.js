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
const { uniKeyNumber } = require("../functions");


// Função para listar todos os departamentos
async function getDepartamentos() {
  try {
    const data = [];
    const querySnap = await getDocs(collection(db, "departamentos"));
    querySnap.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() }); // Inclui todos os campos
    });
    return data;
  } catch (error) {
    console.error("Erro ao listar departamentos:", error.message);
    return null;
  }
}

// Função para criar um novo departamento
async function addDepartamento({  descricao, abreviacao }) {
  try {
    const id = uniKeyNumber(5); 

    await setDoc(doc(db, "departamentos", id), {
      id: id,
      descricao: descricao,
      abreviacao: abreviacao,
    });

    console.log("Departamento criado com sucesso:", { id, descricao, abreviacao });
    return { id };
  } catch (error) {
    console.error("Erro ao criar departamento:", error.message);
    return null;
  }
}

// Função para atualizar um departamento existente
async function updateDepartamento(data) {
  try {
    const docRef = doc(db, "departamentos", data.id);

    await updateDoc(docRef, data);

    console.log("Departamento atualizado com sucesso:", data);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar departamento:", error.message);
    return false;
  }
}

// Função para deletar um departamento
async function deleteDepartamento(id) {
  try {
    const docRef = doc(db, "departamentos", id);
    await deleteDoc(docRef);
    console.log("Departamento deletado com sucesso:", id);
    return true;
  } catch (error) {
    console.error("Erro ao deletar departamento:", error.message);
    return false;
  }
}

module.exports = {
  getDepartamentos,
  addDepartamento,
  updateDepartamento,
  deleteDepartamento,
};
