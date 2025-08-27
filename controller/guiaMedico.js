const { db } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc, deleteDoc } = require("firebase/firestore");
const { uniKeyNumber } = require('../functions');

async function getGuiasMedicos() {
    try {
        const data = [];
        const querySnap = await getDocs(collection(db, "guiasMedicos"));
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}
async function getGuiasMedicosByUserId(userId) {
    try {
        const data = [];
        const q = query(collection(db, "guiasMedicos"), where("idCliente", "==", userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        console.log(data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getGuiaMedico(id) {
    try {
        const docRef = doc(db, "guiasMedicos", id);
        const docSnap = await getDocs(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function addGuiaMedico(dataReceived) {
    try {
        const data = {
            ...dataReceived,
            id: uniKeyNumber(5)
        };
        await setDoc(doc(db, "guiasMedicos", data.id), data);
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function updateGuiaMedico(dataReceived) {
    try {
        const data = {
            ...dataReceived
        };
        await setDoc(doc(db, "guiasMedicos", dataReceived.id), data);
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function deleteGuiaMedico(id) {
    try {
        await deleteDoc(doc(db, "guiasMedicos", id));
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

module.exports = { 
    getGuiasMedicos, 
    getGuiasMedicosByUserId,
    getGuiaMedico, 
    addGuiaMedico, 
    updateGuiaMedico, 
    deleteGuiaMedico 

};
