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
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

async function getPedidosFunerais(idCliente) {
  try {
    const data = [];

    const querySnap = await getDocs(
      query(
        collection(db, "pedidosFunerais"),
        where("idCliente", "==", idCliente)
      )
    );
    querySnap.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function addPedidosFunerais(data) {
  try {
    const id = uniKey(20);
    console.log("Dados recebidos no backend:", data);
    console.log("Dados a serem salvos no Firestore:", { ...data, id });
    const docRef = await setDoc(doc(db, "pedidosFunerais", id), {
      ...data,
      id: id,
    });
    return id;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error.message);
    return null;
  }
}

async function updatePedidosFunerais(id, data) {
  try {
    const docRef = doc(db, "pedidosFunerais", id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar o pedido:", error.message);
    return false;
  }
}

async function deletePedidosFunerais(id) {
  try {
    const docRef = doc(db, "pedidosFunerais", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Erro ao deletar o pedido:", error.message);
    return false;
  }
}

async function generateRelatorioPedido(id) {
  try {
    const docRef = doc(db, "pedidosFunerais", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erro ao gerar relatório:", error.message);
    return null;
  }
}

module.exports = {
  getPedidosFunerais,
  addPedidosFunerais,
  updatePedidosFunerais,
  deletePedidosFunerais,
  generateRelatorioPedido,
};
