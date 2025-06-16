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
async function addDepartamento({ codigo, descricao, abreviacao }) {
  try {
    const id = uniKey(20); // Gera um ID único de 20 caracteres

    await setDoc(doc(db, "departamentos", id), {
      id: id,
      codigo: codigo,
      descricao: descricao,
      abreviacao: abreviacao,
    });

    console.log("Departamento criado com sucesso:", { id, codigo, descricao, abreviacao });
    return { id };
  } catch (error) {
    console.error("Erro ao criar departamento:", error.message);
    return null;
  }
}

// Função para atualizar um departamento existente
async function updateDepartamento(id, { codigo, descricao, abreviacao }) {
  try {
    const docRef = doc(db, "departamentos", id);

    await updateDoc(docRef, {
      codigo: codigo,
      descricao: descricao,
      abreviacao: abreviacao,
    });

    console.log("Departamento atualizado com sucesso:", { id, codigo, descricao, abreviacao });
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
