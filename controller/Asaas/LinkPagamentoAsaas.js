const axios = require('axios');

const api = axios.create({
    baseURL: process.env.URL_TESTE_BANCO_ASAAS,
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': process.env.ASAAS_TESTE_API_KEY
    }
});

const createPaymentLink = async (paymentData) => {
    try {
        const response = await api.post('/paymentLinks', paymentData);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating payment link:', error.response?.data || error.message);
        throw error;
    }
};

const listarLinksPayment = async (filters = {}) => {
    try {
        // Construir query string com os filtros
        const queryParams = new URLSearchParams();
        
        // Adicionar filtros se existirem
        if (filters.customer) queryParams.append('customer', filters.customer);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.offset) queryParams.append('offset', filters.offset);

        const queryString = queryParams.toString();
        const url = `/payments${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error listing payments:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createPaymentLink, listarLinksPayment };
  