const axios = require('axios');
const { db } = require('../firebase');
const { doc, getDocs, getDoc, collection, setDoc, query, where, updateDoc, Timestamp, orderBy } = require("firebase/firestore")
const { uniKey, formatarTimestamp, obterDataFormatadaHoje } = require('../functions');
const { getContratos } = require('./contratos');
const { getConfigComponents } = require('./configuracoes');
const { getCliente } = require('./clientes');

async function getMensalidadesVaoVencer10dias() {
    try {
        const data = [];
        const dia = new Date().getDate().toLocaleString('pt-BR');
        const mes = new Date().getMonth();
        const ano = new Date().getFullYear();
        const dataHoje = new Date(`${mes + 1}/${dia}/${ano}  00:00:00`);
        const dataHojeAux = new Date(`${mes + 1}/${dia}/${ano}  23:59:59`);
        const dataHojeTime = Timestamp.fromDate(dataHoje);
        const dataHojeTimeAux = Timestamp.fromDate(dataHojeAux);
        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('dataVenc', ">=", dataHojeTime),
                where('dataVenc', "<=", dataHojeTimeAux),
                where('paga', "==", false)
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getMensalidadeUnica(id) {
    const docRef = doc(db, "mensalidades", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}


async function getMensalidadesVencemHoje() {
    try {
        const data = [];
        const dia = new Date().getDate().toLocaleString('pt-BR');
        const mes = new Date().getMonth();
        const ano = new Date().getFullYear();
        const dataHoje = new Date(`${mes + 1}/${dia}/${ano}  00:00:00`);
        const dataHojeAux = new Date(`${mes + 1}/${dia}/${ano}  23:59:59`);
        const dataHojeTime = Timestamp.fromDate(dataHoje);
        const dataHojeTimeAux = Timestamp.fromDate(dataHojeAux);
        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('dataVenc', ">=", dataHojeTime),
                where('dataVenc', "<=", dataHojeTimeAux),
                where('paga', "==", false)
            )
        );

        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        console.log(data)
        const clientesData = [];
        for (const element of data) {
            console.log(formatarTimestamp(element.dataVenc))
            const cliente = await getCliente(element.idCliente);
            clientesData.push({
                nome: cliente.nome_titular,
                telefonePrinc: cliente.telefone_princ,
                telefoneAlt: cliente.telefone_alt,
                email: cliente.email,
                valor: element.valor,
                abreviacao: element.abreviacao,
                idCliente: element.idCliente,
                type: element.type.label,
                contrato: element.idContrato,
                element: element,
            });
        }
        return clientesData;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function getMensalidadesVencidas3Dias() {
    try {
        const data = [];
        const agora = Timestamp.now();
        const dataLimite = new Date(agora.toMillis() - (3 * 24 * 60 * 60 * 1000));
        const dataLimiteTimestamp = Timestamp.fromDate(dataLimite);
        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('dataVenc', "==", dataLimiteTimestamp),
                where('paga', "==", false)
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getMensalidadesVencidas10Dias() {
    try {
        const data = [];
        const agora = Timestamp.now();
        const dataLimite = new Date(agora.toMillis() - (10 * 24 * 60 * 60 * 1000));
        const dataLimiteTimestamp = Timestamp.fromDate(dataLimite);
        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('dataVenc', "==", dataLimiteTimestamp),
                where('paga', "==", false)
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getMensalidadesVencidas20Dias() {
    try {
        const data = [];
        const agora = Timestamp.now();
        const dataLimite = new Date(agora.toMillis() - (20 * 24 * 60 * 60 * 1000));
        const dataLimiteTimestamp = Timestamp.fromDate(dataLimite);
        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('dataVenc', "==", dataLimiteTimestamp),
                where('paga', "==", false)
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}



async function getTodasMensalidades(idCliente) {
    try {
        const data = [];

        const querySnap = await getDocs(
            query(
                collection(db, "mensalidades"),
                where('idCliente', "==", idCliente),
                orderBy('dataVenc', 'asc')
            )
        );
        querySnap.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function updateValue(idMensalidade, valor) {
    try {
        await updateDoc(doc(db, "mensalidades", idMensalidade), { valor: valor });
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function addBoleto(id, boletoUrl) {
    try {
        await updateDoc(doc(db, "mensalidades", id), { boletoUrl: boletoUrl });

    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function addBoletoCarne(data) {
    const dataMensalidades = data?.data?.carnes;
    dataMensalidades.forEach(async mensalidade => {
        const carneData = {
            carneId: data?.carneResponse?.data?.carnet_id,
            carneUrl: data?.carneResponse?.data?.link,
            customId: data?.carnes?.metadata?.custom_id,
        }
        await updateDoc(doc(db, "mensalidades", mensalidade.id), { "carneData": carneData });
    });
}

async function getMensalidadeCarne(data) {
    let idQuery = data.data[0]?.custom_id;
    const dataAux = [];
    const carneAux = []
    data.data.forEach((element) => {
        if (element.type === 'carnet_charge') {
            const exist = carneAux.findIndex((item) => item.carneId === element?.identifiers?.charge_id);
            if (exist == -1) {
                carneAux.push({
                    carneId: element.identifiers.charge_id,
                    status: element.status.current,
                });
            } else {
                carneAux[exist].status = element.status.current;
            }
        }

    });
    carneAux.sort((a, b) => a.carneId - b.carneId);
    const querySnap = await getDocs(
        query(
            collection(db, "mensalidades"),
            where('carneData.customId', "==", idQuery),
            orderBy('dataVenc', 'asc')
        )
    );
    let index = 0, indexAux = 0;
    const isBigger = (querySnap.size / carneAux.length === 2 ? true : false);
    const resultPay = [];
    querySnap.forEach((doc) => {
        if (doc.data().paga === false && carneAux[index].status === 'settled') {
            resultPay.push(doc.data());
            updateBoletoCarne(doc.data());
        }
        if (isBigger) {
            indexAux++;
            if (indexAux === 2) {
                index++;
                indexAux = 0;
            }
        } else {
            index++;
        }
    });
    return resultPay;
}

async function updateBoletoCarne(data) {
    console.log(data)

    try {
        const detailPayment = {
            paga: true,
            detailPayment: {
                dataPagamento: new Date(),
                valorPago: data.valor,
                tipoPagamento: 'carnê',
            }
        }
        await updateDoc(doc(db, "mensalidades", data.id), detailPayment);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function pagarMensalidade(idMensalidade, data) {
    try {
        const dataAux = {
            paga: true,
            dataPagamento: new Date(),
            valorPago: data.valor_pago,
            tipoPagamento: data.formaPagamento,
            desconto: data?.desconto,
            usuario: data.usuario,
        }
        await updateDoc(doc(db, "mensalidades", idMensalidade), dataAux);
        console.log(data)
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}



async function gerarMensalidade(data) {
    console.log(data)
    // console.log(data.plano.servicos)
    try {
        const auxQntInicial = data.mesesGerados[0].split('-');
        const auxQntFinal = data.mesesGerados[1].split('-');

        // Convertendo os valores para números
        const mesInicial = parseInt(auxQntInicial[0]);
        const mesFinal = parseInt(auxQntFinal[0]);
        const anoInicial = parseInt(auxQntInicial[1]);
        const anoFinal = parseInt(auxQntFinal[1]);
        let valorPlano = 0;
        let valorServico = 0;
        if (data.plano?.servicos?.length > 0) {
            for (const servico of data.plano.servicos) {
                if (servico.tipoValor === 1) {
                    const configData = await getConfigComponents();
                    valorServico = configData.salarioMinimo * (servico.valorPorcentagemServico / 100);
                } else {
                    valorServico = servico.valorFixoServico;
                }
                console.log(1);
                console.log(valorServico);
                valorPlano += valorServico;
            }
        }

        if (data.plano.tipoValor === 1) {
            console.log(2)
            const configData = await getConfigComponents();
            valorPlano += configData.salarioMinimo * (data.plano.valorPorcentagemPlano / 100);
        } else {
            valorPlano += data.plano.valorFixoPlano;
        }



        for (let ano = anoInicial; ano <= anoFinal; ano++) {
            const mesInicio = (ano === anoInicial) ? mesInicial : 1;
            const mesFim = (ano === anoFinal) ? mesFinal : 12;

            for (let mes = mesInicio; mes <= mesFim; mes++) {
                const mensalidade = {
                    idCliente: data.plano.idCliente,
                    idContrato: data.plano.id,
                    idPlano: data.plano.convenio,
                    abreviacao: data.plano.abreviacao,
                    id: uniKey(30),
                    valor: valorPlano,
                    type: data.tipoTaxa,
                    paga: false,
                    data: new Date(),
                    dataVenc: new Date(ano, mes - 1, data.plano.dia_vencimento),
                };
                await setDoc(doc(db, "mensalidades", mensalidade.id), mensalidade);
            }
        }
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}



async function gerarMensalidadeUnica(data) {
    try {
        const dataVencUTC = new Date(data.dataVenc);
        const dataAux = {
            idCliente: data.plano.idCliente,
            idContrato: data.plano.id,
            abreviacao: data.plano.abreviacao,
            id: uniKey(30),
            valor: data.valor,
            paga: false,
            data: new Date(),
            type: data.tipoTaxa,
            // Cria uma data UTC manualmente para evitar problemas de fuso horário, mas adiciona 2 dias para compensar o fuso
            dataVenc: new Date(Date.UTC(dataVencUTC.getFullYear(), dataVencUTC.getMonth(), dataVencUTC.getDate() + 2, 0, 0, 0, 0)),
        };
        console.log(dataAux)
        await setDoc(doc(db, "mensalidades", dataAux.id), dataAux);
        return true;
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getMensalidadesAtrasadasQnt(qntMin, qntMax, idCliente = null) {
    try {
        if (idCliente) {
            const data = [];
            const agora = Timestamp.now();
            const dataLimiteMin = new Date(agora.toMillis() - ((Number(qntMin)) * 24 * 60 * 60 * 1000));
            const dataLimiteMax = new Date(agora.toMillis() - ((Number(qntMax)) * 24 * 60 * 60 * 1000));
            const querySnap = await getDocs(
                query(
                    collection(db, "mensalidades"),
                    where('dataVenc', ">=", dataLimiteMax),
                    where('dataVenc', "<=", dataLimiteMin),
                    where('paga', "==", false),
                    where('idCliente', "==", idCliente)
                )
            );
            querySnap.forEach((doc) => {
                data.push(doc.data());
            });
            return data;
        } else {
            const data = [];
            console.log(qntMin, qntMax)
            const agora = Timestamp.now();
            const dataLimiteMin = new Date(agora.toMillis() - ((Number(qntMin)) * 24 * 60 * 60 * 1000));
            const dataLimiteMax = new Date(agora.toMillis() - ((Number(qntMax)) * 24 * 60 * 60 * 1000));
            const querySnap = await getDocs(
                query(
                    collection(db, "mensalidades"),
                    where('dataVenc', ">=", dataLimiteMax),
                    where('dataVenc', "<=", dataLimiteMin),
                    where('paga', "==", false)
                )
            );
            querySnap.forEach((doc) => {
                data.push(doc.data());
            });
            return data;

        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}

async function getClientesByQuery(querys) {
    try {
        let queryField;
        const data = [];
        let activeData = false;
        console.log(querys)
        if (querys?.nome) {
            queryField = "nome_titular";
            const nameAux = querys.nome.toUpperCase();
            const querySnap = await getDocs(
                query(
                    collection(db, "clientes"),
                    where(queryField, ">=", nameAux),
                    where(queryField, "<", nameAux + "\uf8ff")
                )
            );
            querySnap.forEach((doc) => {
                const dataAux = doc.data();
                const existingData = data.find(existing => existing?.id === dataAux.id);
                if (!existingData) {
                    data.push(dataAux);
                }
            });
        }
        if (querys?.cpf) {
            queryField = "cpf";
            const querySnap = await getDocs(
                query(
                    collection(db, "clientes"),
                    where(queryField, ">=", querys?.cpf),
                    where(queryField, "<", querys?.cpf + "\uf8ff"),
                )
            );
            querySnap.forEach((doc) => {
                const dataAux = doc.data();
                const existingData = data.find(existing => existing.id === dataAux.id);
                if (!existingData) {
                    data.push(dataAux);
                }
            });
        }
        if (querys?.dia_vencimento_mensalidade) {
            queryField = "dia_vencimento";
            activeData = true;
            const querySnap = await getDocs(
                query(
                    collection(db, "contratos"),
                    where(queryField, "==", querys?.dia_vencimento_mensalidade),
                )
            );
            console.log(querySnap?.docs?.length)
            if (querySnap.docs.length > 0) {
                for (const doc of querySnap.docs) {
                    const dataAux = doc.data();
                    const existingData = data.find(existing => existing?.id === dataAux?.idCliente);
                    if (!existingData) {
                        try {
                            console.log(dataAux.idCliente)
                            const clienteData = await getCliente(dataAux.idCliente);
                            console.log(clienteData)
                            data.push(clienteData);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }

            }

        }

        if (querys?.qnt_meses_atrasos_inicio) {
            if (activeData) {
                const dataAux = data;
                for (const doc of dataAux) {
                    const mensalidadesAtrasadas = await getMensalidadesAtrasadasQnt(querys?.qnt_meses_atrasos_inicio, querys?.qnt_meses_atrasos_final, doc.id);
                    console.log(mensalidadesAtrasadas)
                    // if (mensalidadesAtrasadas.length > 0) {
                    //     data.push(doc);
                    //     activeData = true;
                    // }
                }
            } else {
                const dataResult = await getMensalidadesAtrasadasQnt(querys?.qnt_meses_atrasos_inicio, querys?.qnt_meses_atrasos_final);
                for (const doc of dataResult) {
                    const existingData = data.find(existing => existing?.id === doc?.idCliente);
                    if (!existingData) {
                        try {
                            const clienteData = await getCliente(doc.idCliente);
                            data.push(clienteData);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }


            }

        }

        return data;

    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
        return null;
    }
}


async function getMensalidadesBySetorCobranca(dataReceived) {
    const data = [];
    let querySnap;
    const processedClients = new Set(); // To track processed client IDs

    if (dataReceived.setor_cobranca) {
        // Verifica se é uma string com múltiplos valores
        if (typeof dataReceived.setor_cobranca === 'string' && dataReceived.setor_cobranca.includes(',')) {
            const setores = dataReceived.setor_cobranca.split(',').map(s => Number(s.trim()));
            const allResults = new Set(); // Para evitar duplicatas

            // Faz uma query para cada setor
            for (const setor of setores) {
                const conditions = [where('setor_cobranca', '==', setor)];

                // Adiciona condições de data se existirem
                if (dataReceived.data_inicio && dataReceived.data_fim) {
                    const dataInicio = dataReceived.data_inicio.split('-');
                    const dataFim = dataReceived.data_fim.split('-');
                    const diaInicio = Number(dataInicio[2]);
                    const diaFim = Number(dataFim[2]);

                    conditions.push(where('dia_vencimento', '>=', diaInicio));
                    conditions.push(where('dia_vencimento', '<=', diaFim));
                }

                querySnap = await getDocs(
                    query(
                        collection(db, "contratos"),
                        ...conditions
                    )
                );

                // Adiciona os resultados ao Set
                querySnap.docs.forEach(doc => {
                    allResults.add(doc.id);
                });
            }

            // Converte o Set de IDs em documentos
            const clientesData = [];
            for (const docId of allResults) {
                try {
                    const contratoRef = doc(db, "contratos", docId);
                    const contratoSnap = await getDoc(contratoRef);
                    if (contratoSnap.exists()) {
                        const clienteId = contratoSnap.data().idCliente;
                        // Only process if we haven't seen this client before
                        if (!processedClients.has(clienteId)) {
                            processedClients.add(clienteId);
                            const clienteRef = doc(db, "clientes", clienteId);
                            const clienteSnap = await getDoc(clienteRef);
                            if (clienteSnap.exists()) {
                                clientesData.push({
                                    ...clienteSnap.data(),
                                    contrato: contratoSnap.data()
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error('Erro ao buscar cliente:', err);
                }
            }
            data.push(...clientesData);
        } else {
            // Caso seja um único valor
            const setorCobranca = Number(dataReceived.setor_cobranca);
            const conditions = [where('setor_cobranca', '==', setorCobranca)];

            if (dataReceived.data_inicio && dataReceived.data_fim) {
                const dataInicio = dataReceived.data_inicio.split('-');
                const dataFim = dataReceived.data_fim.split('-');
                const diaInicio = Number(dataInicio[2]);
                const diaFim = Number(dataFim[2]);

                conditions.push(where('dia_vencimento', '>=', diaInicio));
                conditions.push(where('dia_vencimento', '<=', diaFim));
            }

            querySnap = await getDocs(
                query(
                    collection(db, "contratos"),
                    ...conditions
                )
            );

            const clientesData = [];
            for (const contrato of querySnap.docs) {
                try {
                    const clienteId = contrato.data().idCliente;
                    // Only process if we haven't seen this client before
                    if (!processedClients.has(clienteId)) {
                        processedClients.add(clienteId);
                        const clienteRef = doc(db, "clientes", clienteId);
                        const clienteSnap = await getDoc(clienteRef);
                        if (clienteSnap.exists()) {
                            clientesData.push({
                                ...clienteSnap.data(),
                                contrato: contrato.data()
                            });
                        }
                    }
                } catch (err) {
                    console.error('Erro ao buscar cliente:', err);
                }
            }
            data.push(...clientesData);
        }
    }
    return data;
}

async function gerarMensalidadesTodosContratos(dataReceived) {
    try {
        console.log(dataReceived);
        const results = {
            success: [],
            errors: []
        };

        // Parse the date strings
        const [mesInicio, anoInicio] = dataReceived.mesInicio.split('/').map(Number);
        const [mesFim, anoFim] = dataReceived.mesFim.split('/').map(Number);

        // Get all contracts for tipo_cliente 0
        const querySnap = await getDocs(
            query(
                collection(db, "contratos"),
                where('tipo_cliente', '==', 0)
            )
        );
        const configData = await getConfigComponents();


        for (const doc of querySnap.docs) {
            try {
                const contrato = await doc.data();

                // Generate mensalidades for each month in the range
                for (let ano = anoInicio; ano <= anoFim; ano++) {
                    const mesInicioAno = (ano === anoInicio) ? mesInicio : 1;
                    const mesFimAno = (ano === anoFim) ? mesFim : 12;
                    for (let mes = mesInicioAno; mes <= mesFimAno; mes++) {
                        console.log(`Contrato: ${doc.id} - Mês: ${mes} - Ano: ${ano}`);

                        let valorTotal = 0;

                        // Calculate service values
                        if (contrato.servicos?.length > 0) {
                            for (const servico of contrato.servicos) {
                                let valorServico = 0;
                                if (servico.tipoValor === 1) {
                                    valorServico = configData.salarioMinimo * (servico.valorPorcentagemServico / 100);
                                } else {
                                    valorServico = servico.valorFixoServico;
                                }
                                valorTotal += valorServico;
                            }
                        }
                        // Calculate plan value
                        if (contrato.tipoValor === 1) {
                            valorTotal += configData.salarioMinimo * (contrato.valorPorcentagemPlano / 100);
                        } else {
                            valorTotal += contrato.valorFixoPlano;
                        }

                        const mensalidade = {
                            idCliente: contrato.idCliente,
                            idContrato: contrato.id,
                            idPlano: contrato.convenio,
                            abreviacao: contrato.abreviacao,
                            id: uniKey(30),
                            valor: valorTotal,
                            type: contrato.tipoTaxa,
                            paga: false,
                            data: new Date(),
                            dataVenc: new Date(ano, mes - 1, contrato.dia_vencimento),
                            observacao: dataReceived.observacao || ''
                        };

                        const mensalidadeRef = await setDoc(doc(db, "mensalidades", mensalidade.id), mensalidade);
                        console.log('Mensalidade criada:', mensalidade.id);
                        // results.success.push({
                        //     contratoId: contrato.id,
                        //     clienteId: contrato.idCliente,
                        //     mensalidadeId: mensalidade.id,
                        //     mes: mes,
                        //     ano: ano
                        // });
                    }
                }
            } catch (error) {
                results.errors.push({
                    contratoId: doc.id,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            data: results
        };
    } catch (error) {
        console.error('Erro ao gerar mensalidades:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { getMensalidadeUnica, getClientesByQuery, getMensalidadesBySetorCobranca, addBoleto, getMensalidadeCarne, getMensalidadesVencidas10Dias, getMensalidadesVencidas3Dias, getMensalidadesVencemHoje, getTodasMensalidades, getMensalidadesAtrasadasQnt, pagarMensalidade, gerarMensalidade, gerarMensalidadeUnica, updateValue, addBoletoCarne, gerarMensalidadesTodosContratos };