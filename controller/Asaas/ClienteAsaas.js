const axios = require('axios');

//Só mudar o baseURL e o access_token
const api = axios.create({
    baseURL: process.env.URL_TESTE_BANCO_ASAAS,
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': process.env.ASAAS_TESTE_API_KEY
    }
});

const createCustomer = async (customerData) => {
    try {
        const response = await api.post('/customers', customerData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createCustomer };
