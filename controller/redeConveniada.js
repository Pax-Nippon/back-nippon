const { db } = require("../firebase");
const { collection, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs } = require("firebase/firestore");

// Função para criar um novo convênio na Rede Conveniada
async function createConvenio(data) {
    try {
        const id = data.id || Date.now().toString(); // Gera um ID único se não for fornecido
        const docRef = doc(db, "redeConveniada", id);
        await setDoc(docRef, data);
        return { message: "Convênio criado com sucesso", id };
    } catch (error) {
        console.error("Erro ao criar convênio:", error.message);
        throw new Error("Erro ao criar convênio");
    }
}

// Função para atualizar um convênio existente na Rede Conveniada
async function updateConvenio(id, data) {
    try {
        const docRef = doc(db, "redeConveniada", id);
        await updateDoc(docRef, data);
        return { message: "Convênio atualizado com sucesso", id };
    } catch (error) {
        console.error("Erro ao atualizar convênio:", error.message);
        throw new Error("Erro ao atualizar convênio");
    }
}

// Função para excluir um convênio da Rede Conveniada
async function deleteConvenio(id) {
    try {
        const docRef = doc(db, "redeConveniada", id);
        await deleteDoc(docRef);
        return { message: "Convênio excluído com sucesso", id };
    } catch (error) {
        console.error("Erro ao excluir convênio:", error.message);
        throw new Error("Erro ao excluir convênio");
    }
}

// Função para buscar convênios com filtros
async function getRedeConveniada(filters) {
    try {
        const conditions = [];
        const { cidade, especialidade, segmento } = filters;

        // Adiciona filtros conforme os parâmetros enviados
        if (cidade) {
            conditions.push(where("cidade", "==", cidade));
        }
        if (especialidade) {
            conditions.push(where("especialidade", "array-contains", especialidade));
        }
        if (segmento) {
            conditions.push(where("segmento", "array-contains", segmento));
        }

        // Faz a consulta no Firestore
        const querySnap = await getDocs(query(collection(db, "redeConveniada"), ...conditions));
        const data = [];
        querySnap.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });

        return data;
    } catch (error) {
        console.error("Erro ao buscar Rede Conveniada:", error.message);
        throw new Error("Erro ao buscar Rede Conveniada");
    }
}

module.exports = { createConvenio, updateConvenio, deleteConvenio, getRedeConveniada };