const axios = require('axios');
const { db, storage } = require('../firebase');
const { doc, getDocs, collection, setDoc, query, where, updateDoc } = require("firebase/firestore")
const { uniKey } = require('../functions');
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const {UpdateClienteArquivo} = require('./clientes');



// async function getArquivos(idCliente) {
//     try {
//         const data = [];
//         const querySnap = await getDocs(
//             query(
//                 collection(db, "arquivos"),
//                 where('idCliente', "==", idCliente)
//             )
//         );
//         querySnap.forEach((doc) => {
//             data.push(doc.data());
//         });
//         return data;
//     } catch (error) {
//         console.error('Erro ao fazer a requisição:', error.message);
//         return null;
//     }
// }

async function uploadArquivo(data, id, file) {
    const name = data.nome + '-'+data.tipo +'-'+ id + '.pdf';
    const storageRef = ref(storage, name);
    try {
        const snapshot = await uploadBytes(storageRef, file.buffer);
        const downloadURL = await getDownloadURL(storageRef);
        const aux = {
            name: name,
            url: downloadURL,
            idCliente: id
        }
        console.log(data.arquivos)
        const dataArray = data.arquivos;
        dataArray.push(aux);
        const result =  await UpdateClienteArquivo(dataArray, id);
        return downloadURL;
    } catch (error) {
        console.error('Erro ao fazer o upload:', error.message);
        throw error; // Rejeita o erro para que possa ser manipulado no seu controlador de rota.
    }
}


module.exports = {  uploadArquivo };
