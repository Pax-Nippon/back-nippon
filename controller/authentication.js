const { db } = require('../firebase');
const { collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
const jwt = require('jsonwebtoken');
require('dotenv').config()

async function getUser(data) {
    const login = data.user;
    const senha = data.password;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("login", "==", login), where("password", "==", senha));
    try {
        const querySnapshot = await getDocs(q);
        const user = querySnapshot.docs[0];
        const data = user.data()
        if (user) {
            const token = jwt.sign({ userId: user.id, permission: data.type}, process.env.JWT_SECRET, { expiresIn: '24h' });
            return { token, data };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
        return null;
    }
}

function verificarToken(req, res, next) {
    const token = req.header('x-access-token');
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.userId = decoded.userId;
        req.permission = decoded.permission;
        next();
    });
}


async function isLogged(token) {

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const user = docSnap.data();
            return user
        }
        else {
            throw new Error('Usuário não autenticado');
            return null;
        }
    } catch (error) {
        throw new Error('Usuário não autenticado');
        return null;
    }
}

async function isClienteLogged(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clienteId = decoded.userId; // Obtém o ID do cliente do token
        const clienteRef = doc(db, "clientes", clienteId);
        const clienteSnap = await getDoc(clienteRef);
        if (clienteSnap.exists()) {
            const cliente = clienteSnap.data();
            return cliente           
        }
        else { 
             throw new Error('Cliente não encontrado'); // Retorna os dados do cliente
        }
    } catch (error) {
        console.error('Erro ao validar cliente:', error.message);
        throw new Error('Token inválido ou cliente não encontrado');
    }
}

async function havePermissionVendedor(req, res, next){
    try {
        const token = req.header('x-access-token');
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const permissao = decoded.permission;
        if (permissao === '1' || permissao === '2' || permissao === '3') {
            next();
        }
        else {
            return res.status(401).json({ message: 'Usuário sem permissão' });
        }
    } catch (error) {
        return res.status(401).json({ message: error });

    }
}
async function havePermissionEditor(req, res, next){
    try {
        const token = req.header('x-access-token');
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const permissao = decoded.permission;
        if ( permissao === 0 || permissao === 1) {
            next();
        }
        else {
            return res.status(401).json({ message: 'Usuário sem permissão' });

        }
    } catch (error) {
        return res.status(401).json({ message: 'Usuário sem permissão' });
    }
}
async function havePermissionAdministrador(req, res, next){
    try {
        const token = req.header('x-access-token');
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const permissao = decoded.permission;
        if (permissao === 0) {
            next();
        }
        else {
            return res.status(401).json({ message: 'Usuário sem permissão' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Usuário sem permissão' });

    }
}
module.exports = { getUser, verificarToken, isLogged,isClienteLogged, havePermissionVendedor, havePermissionEditor, havePermissionAdministrador};
