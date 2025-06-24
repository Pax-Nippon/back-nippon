const axios = require('axios');
const { db } = require('../../firebase');
const { updateDoc, doc } = require('firebase/firestore');

//Só mudar o baseURL e o access_token
const api = axios.create({
    baseURL: process.env.URL_TESTE_BANCO_ASAAS,
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': process.env.ASAAS_TESTE_API_KEY
    }
});

const createCustomer = async (customerData, id) => {
    try {
        const response = await api.post('/customers', customerData);
        const idAsaas = response.data.id;
        const docRef = await updateDoc(doc(db, "clientes", id), {
            idAsaas: idAsaas,
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
        throw error;
    }
};

const searchCustomer = async (searchParams) => {
    try {
        // Construir query string com os parâmetros de busca
        const queryParams = new URLSearchParams();
        if (searchParams.cpfCnpj) queryParams.append('cpfCnpj', searchParams.cpfCnpj);
        if (searchParams.name) queryParams.append('name', searchParams.name);
        if (searchParams.email) queryParams.append('email', searchParams.email);
        if (searchParams.limit) queryParams.append('limit', searchParams.limit);
        if (searchParams.offset) queryParams.append('offset', searchParams.offset);
        const queryString = queryParams.toString();
        const url = `/customers${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(url);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching customer:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createCustomer, searchCustomer };
