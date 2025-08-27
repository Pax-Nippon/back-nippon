const axios = require('axios');
const { db } = require('../../firebase');
const { doc, updateDoc, getDoc } = require('firebase/firestore');

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
        console.log('Dados do pagamento:', paymentData);
        
        // Verificar se já existe um link de pagamento para esta mensalidade
        if (paymentData.id) {
            try {
                const mensalidadeRef = doc(db, "mensalidades", paymentData.id);
                const mensalidadeSnap = await getDoc(mensalidadeRef);
                
                if (mensalidadeSnap.exists()) {
                    const mensalidadeData = mensalidadeSnap.data();
                    
                    // Se já existe um link de pagamento válido, retornar ele
                    if (mensalidadeData.asaasPaymentId && mensalidadeData.asaasPaymentUrl) {
                        console.log(`Link de pagamento já existe para mensalidade ${paymentData.id}`);
                        return {
                            ...mensalidadeData.asaasPaymentData,
                            mensalidadeUpdated: false,
                            mensalidadeId: paymentData.id,
                            existingPayment: true,
                            message: 'Link de pagamento já existe para esta mensalidade'
                        };
                    }
                }
            } catch (checkError) {
                console.error('Erro ao verificar mensalidade existente:', checkError);
                // Continuar com a criação mesmo se falhar a verificação
            }
        }
        
        // Criar uma cópia do paymentData sem o campo 'id' para enviar para a API do Asaas
        const { id, ...paymentDataForAsaas } = paymentData;
        console.log('Dados do pagamento para Asaas (sem id):', paymentDataForAsaas);
        
        // Criar o pagamento no Asaas
        const response = await api.post('/payments', paymentDataForAsaas);
        console.log('Resposta do Asaas:', response.data);
        
        // Se o pagamento foi criado com sucesso e temos o ID da mensalidade
        if (response.data && paymentData.id) {
            try {
                // Atualizar a mensalidade com os dados do link de pagamento
                const mensalidadeRef = doc(db, "mensalidades", paymentData.id);
                const updateData = {
                    asaasPaymentId: response.data.id,
                    asaasPaymentUrl: response.data.invoiceUrl || response.data.bankSlipUrl,
                    asaasPaymentStatus: response.data.status,
                    asaasPaymentData: response.data,
                    lastUpdated: new Date()
                };
                
                await updateDoc(mensalidadeRef, updateData);
                console.log(`Mensalidade ${paymentData.id} atualizada com link de pagamento`);
                
                // Retornar os dados do pagamento com confirmação de atualização
                return {
                    ...response.data,
                    mensalidadeUpdated: true,
                    mensalidadeId: paymentData.id,
                    existingPayment: false
                };
            } catch (updateError) {
                console.error('Erro ao atualizar mensalidade:', updateError);
                // Retornar os dados do pagamento mesmo se falhar a atualização
                return {
                    ...response.data,
                    mensalidadeUpdated: false,
                    updateError: updateError.message,
                    existingPayment: false
                };
            }
        }
        
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

const createNewPaymentLink = async (paymentData) => {
    try {
        console.log('Criando novo link de pagamento:', paymentData);
        
        // Criar uma cópia do paymentData sem o campo 'id' para enviar para a API do Asaas
        const { id, ...paymentDataForAsaas } = paymentData;
        console.log('Dados do pagamento para Asaas (sem id):', paymentDataForAsaas);
        
        // Criar o pagamento no Asaas
        const response = await api.post('/payments', paymentDataForAsaas);
        console.log('Resposta do Asaas:', response.data);
        
        // Se o pagamento foi criado com sucesso e temos o ID da mensalidade
        if (response.data && paymentData.id) {
            try {
                // Atualizar a mensalidade com os dados do link de pagamento
                const mensalidadeRef = doc(db, "mensalidades", paymentData.id);
                const updateData = {
                    asaasPaymentId: response.data.id,
                    asaasPaymentUrl: response.data.invoiceUrl || response.data.bankSlipUrl,
                    asaasPaymentStatus: response.data.status,
                    asaasPaymentData: response.data,
                    lastUpdated: new Date()
                };
                
                await updateDoc(mensalidadeRef, updateData);
                console.log(`Mensalidade ${paymentData.id} atualizada com novo link de pagamento`);
                
                return {
                    ...response.data,
                    mensalidadeUpdated: true,
                    mensalidadeId: paymentData.id,
                    existingPayment: false
                };
            } catch (updateError) {
                console.error('Erro ao atualizar mensalidade:', updateError);
                return {
                    ...response.data,
                    mensalidadeUpdated: false,
                    updateError: updateError.message,
                    existingPayment: false
                };
            }
        }
        
        return response.data;
    } catch (error) {
        console.error('Error creating new payment link:', error.response?.data || error.message);
        throw error;
    }
};

// Cria um Payment Link no Asaas que pode aceitar múltiplos métodos (ex: BOLETO, CREDIT_CARD, PIX)
// Espera receber no payload os campos suportados pela API de paymentLinks do Asaas,
// por exemplo: { name, value, billingTypes: ['BOLETO','CREDIT_CARD','PIX'], description, customer, ... }
// Se vier um campo id (mensalidade.id), o documento da mensalidade será atualizado com o resultado
const createMultipaymentLink = async (paymentLinkData) => {
    try {
        const { id, ...paymentLinkPayload } = paymentLinkData;

        // Tenta evitar duplicidade caso já exista um link salvo na mensalidade
        if (id) {
            try {
                const mensalidadeRef = doc(db, 'mensalidades', id);
                const mensalidadeSnap = await getDoc(mensalidadeRef);
                if (mensalidadeSnap.exists()) {
                    const mData = mensalidadeSnap.data();
                    if (mData.asaasPaymentLinkId && (mData.asaasPaymentLinkUrl || mData.asaasPaymentUrl)) {
                        return {
                            ...mData.asaasPaymentLinkData,
                            mensalidadeUpdated: false,
                            mensalidadeId: id,
                            existingPayment: true,
                            message: 'Payment link já existe para esta mensalidade'
                        };
                    }
                }
            } catch (_) {
                // segue criação mesmo se a verificação falhar
            }
        }

        const response = await api.post('/paymentLinks', paymentLinkPayload);

        // Atualiza mensalidade, se id informado
        if (response.data && id) {
            try {
                const mensalidadeRef = doc(db, 'mensalidades', id);
                const url = response.data.url || response.data.shortUrl || response.data.invoiceUrl || response.data.bankSlipUrl;
                const updateData = {
                    asaasPaymentLinkId: response.data.id,
                    asaasPaymentLinkUrl: url,
                    asaasPaymentLinkStatus: response.data.status,
                    asaasPaymentLinkData: response.data,
                    lastUpdated: new Date()
                };
                await updateDoc(mensalidadeRef, updateData);
                return {
                    ...response.data,
                    mensalidadeUpdated: true,
                    mensalidadeId: id,
                    existingPayment: false
                };
            } catch (updateError) {
                return {
                    ...response.data,
                    mensalidadeUpdated: false,
                    updateError: updateError.message,
                    existingPayment: false
                };
            }
        }

        return response.data;
    } catch (error) {
        console.error('Error creating multipayment link:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createPaymentLink, createNewPaymentLink, listarLinksPayment, createMultipaymentLink };
  