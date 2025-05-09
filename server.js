const express = require('express');
const app = express();
const authentication = require('./controller/authentication');
const clientes = require('./controller/clientes');
const mensalidades = require('./controller/mensalidades');
const planos = require('./controller/planos');
const servicos = require('./controller/servicos');
const users = require('./controller/users');
const contratos = require('./controller/contratos');
const guiaMedico = require('./controller/guiaMedico');
const logs = require('./controller/logs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const arquivos = require('./controller/arquivos');
const carne = require('./controller/Efi/carne');
const assinatura = require('./controller/Efi/assinatura');
const pix = require('./controller/Efi/pix');
const cobrancaWhatsapp = require('./controller/cobrancaWhatsApp');
const pedidosFunerais = require('./controller/pedidosFuneral');
const departamentos = require('./controller/departamentos');
const setores = require('./controller/setor');
const schedule = require('node-schedule');
const path = require('path');
const { verificarToken, havePermissionAdministrador, havePermissionEditor, havePermissionVendedor } = require('./controller/authentication');
const cors = require("cors");
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());
app.use(express.text())
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

//Login
app.post('/login', async (req, res) => {
    try {
        const user = req.body;
        console.log(user)
        const data = await authentication.getUser(user);
        if (data) {
            res.json(data);
        } else {
            res.status(400).json({ message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Usuário ou senha inválidos' });
    }
})
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/isLogged', async (req, res) => {
    const token = req.header('x-access-token');
    if (!token) return res.status(400).json({ message: 'Usuário não autenticado' });
    try {
        const data = await authentication.isLogged(token);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'Usuário não autenticado' });
    }
})


//Usuários
app.get('/users/getUsers', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = await users.getUsers();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.get('/users/getUsersType', verificarToken, async (req, res) => {
    try {
        const query = req.query;
        const data = await users.getUsersType(query.type);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.post('/users/adduser', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const dataReceived = req.body;
        const data = await users.AddUser(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.put('/users/updateuser', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const dataReceived = req.body;
        console.log(dataReceived)
        const data = await users.UpdateUser(dataReceived);
        res.json(data);
    } catch (error) {
        res.json({ message: 'error' });
    }
})
app.delete('/users/delete/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await users.DeleteUser(id);
        res.json(data);
    } catch (error) {
        res.json({ message: 'error' });
    }
})


//Mensalidades
app.get('/mensalidades/getMensalidadesAtrasadas', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.params.id;
        const data = await mensalidades.getMensalidadesAtrasadas();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.get('/mensalidades/getAllMensalidades/:id', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.params.id;
        const data = await mensalidades.getTodasMensalidades(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.put('/mensalidades/pagarMensalidade/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const dataBody = req.body;
        const data = await mensalidades.pagarMensalidade(id, dataBody);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.put('/mensalidades/updateValue/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const valor = req.body.valor;
        const data = await mensalidades.updateValue(id, valor);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.post('/mensalidades/gerarMensalidades', verificarToken, async (req, res) => {
    try {
        const data = await mensalidades.gerarMensalidade(req.body);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.post('/mensalidades/gerarMensalidadeUnica', verificarToken, async (req, res) => {
    try {
        const data = await mensalidades.gerarMensalidadeUnica(req.body);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.post('/mensalidades/gerarMensalidadesTodosContratos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const dataReceived = req.body;
        const data = await mensalidades.gerarMensalidadesTodosContratos(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

//Planos
app.get('/planos/getAllPlanos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = await planos.getPlanos();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.post('/planos/addPlano', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = req.body;
        const result = await planos.addPlano(data);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.put('/planos/updatePlano/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = req.body;
        const id = req.params.id;
        const result = await planos.updatePlano(data, id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

//Clientes
app.get('/clientes/getCliente/:id', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.params.id;
        const data = await clientes.getCliente(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.get('/clientes/getClientes', verificarToken, async (req, res) => {
    try {
        const data = await clientes.getClientes();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.get('/clientes/getClientesByQuery', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.query;
        const data = await mensalidades.getClientesByQuery(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.get('/clientes/getMensalidadesBySetorCobranca', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.query;
        const data = await mensalidades.getMensalidadesBySetorCobranca(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})


app.post('/clientes/addcliente', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.body;
        const data = await clientes.AddCliente(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.put('/clientes/updateCliente', verificarToken, async (req, res) => {
    try {
        const dataReceived = req.body;
        const data = await clientes.UpdateCliente(dataReceived);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

//Contratos
app.get('/contratos/getContratos/:id', verificarToken, async (req, res) => {
    try {
        const idUser = req.params.id;
        const data = await contratos.getContratos(idUser);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.post('/contratos/addContrato', verificarToken, async (req, res) => {
    try {
        const dataBody = req.body;
        const data = await contratos.addContrato(dataBody);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.post('/contratos/uploadContrato/:id', verificarToken, upload.single('file'), async (req, res) => {
    try {
        const id = req.params.id;
        const file = req.file;
        const data = await contratos.uploadContrato(id, file);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao fazer upload do arquivo' });
    }
});

app.post('/contratos/uploadArquivo/:id', verificarToken, upload.single('file'), async (req, res) => {
    try {
        const name = req.body;
        const id = req.params.id;
        const file = req.file;
        const data = await contratos.uploadArquivo(name, id, file);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao fazer upload do arquivo' });
    }
});

app.put('/contratos/updateDependente/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await contratos.updateDependente(data, id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})
app.put('/contratos/updateContrato/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await contratos.updateContrato(data, id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
});


//-----------------------------------------------------------Arquivos-----------------------------------------------------------------------
app.post('/arquivos/:id', verificarToken, upload.single('file'), async (req, res) => {
    try {
        const dataBody = JSON.parse(req.body.data);
        let dataAux = {
            nome: dataBody.nome,
            type: dataBody.tipo,
            arquivos: dataBody.arquivos
        };
        const id = req.params.id;
        const file = req.file;
        const data = await arquivos.uploadArquivo(dataBody, id, file);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao fazer upload do arquivo' });
    }
});
app.get('/arquivos/getArquivo/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await arquivos.getArquivo(id);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})


//-----------------------------------------------------------Serviços-----------------------------------------------------------------------
app.get('/servicos/getAllServicos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = await servicos.getServicos();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.post('/servicos/addServicos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const dataBody = req.body;
        const data = await servicos.addServicos(dataBody);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.put('/servicos/updateServicos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const data = await servicos.updateServicos();
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})


//-----------------------------------------------------------Carne-----------------------------------------------------------------------
app.post('/carne/gerarCarne', verificarToken, async (req, res) => {
    try {
        const data = await carne.createCarneEfi(req.body);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

app.post('/carne/changeStatus', async (req, res) => {
    try {
        const inputData = req.body;
        let token;
        if (typeof inputData.notification === 'string') {
            token = inputData.notification;
        } else if (typeof inputData.notification === 'object' && inputData.notification.token) {
            token = inputData.notification.token;
        } else {
            token = requestId;
        }
        const outputJSON = {
            "token": token,
        };

        const data = await carne.listenCarne(outputJSON);

        res.json('foi');
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
});


//-----------------------------------------------------------Assinatura-----------------------------------------------------------------------
app.post('/assinatura/gerarLinkAssinatura', async (req, res) => {
    try {
        const data = await assinatura.criarLinkAssinatura(req.body);
        res.json({ message: 'foi' });
    }
    catch (error) {
        res.status(400).json({ message: 'error' });
    }
});


//-----------------------------------------------------------Gerar Links de Pagamento-----------------------------------------------------------------------

app.post('/gerarLink/pix', verificarToken, async (req, res) => {
    try {
        const data = await pix.gerarPiximediato(req.body);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: error });
    }
})

//-----------------------------------------------------------Cobrança-----------------------------------------------------------------------
// const job = schedule.scheduleJob('16 12 * * *', async function() {
//     //Pega Cobranca do Dia
//     // const cobrancaDoDia = await cobrancaWhatsapp.enviaCobrancaWhatsapp(); 

//     const data = await cobrancaWhatsapp.enviaCobrancaWhatsapp(req.body);
//     // cobranca.cobrancaEmail(data);
//   });


app.post('/cobranca/gerarCobranca', async (req, res) => {
    try {
        const data = await cobrancaWhatsapp.enviaCobrancaWhatsapp(req.body);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})


app.post('/whatsapp/logar', async (req, res) => {
    try {
        const data = await cobrancaWhatsapp.logarWhatsApp();
        console.log(data);
        res.json(data);
    } catch (error) {
        res.status(400).json({ message: 'error' });
    }
})

//-----------------------------------------------------------Pedido Funeral-----------------------------------------------------------------------//
app.get('/api/pedidosFunerais/:idCliente', verificarToken, async (req, res) => {
    const pedidos = await pedidosFunerais.getPedidosFunerais(req.params.idCliente);
    if (pedidos) {
        res.status(200).json(pedidos);
    } else {
        res.status(404).json({ message: 'Nenhum pedido encontrado' });
    }
});

app.post('/api/pedidosFunerais', verificarToken, async (req, res) => {
    const data = req.body;
    const id = await pedidosFunerais.addPedidosFunerais(data);
    if (id) {
        res.status(201).json({ message: 'Pedido criado com sucesso', id });
    } else {
        res.status(500).json({ message: 'Erro ao criar o pedido' });
    }
});

app.put('/api/pedidosFunerais/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    const success = await pedidosFunerais.updatePedidosFunerais(req.params.id, req.body);
    if (success) {
        res.status(200).json({ message: 'Pedido atualizado com sucesso' });
    } else {
        res.status(500).json({ message: 'Erro ao atualizar o pedido' });
    }
});

app.delete('/api/pedidosFunerais/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    const success = await pedidosFunerais.deletePedidosFunerais(req.params.id);
    if (success) {
        res.status(200).json({ message: 'Pedido deletado com sucesso' });
    } else {
        res.status(500).json({ message: 'Erro ao deletar o pedido' });
    }
});

app.get('/api/relatorioPedido/:id', verificarToken, async (req, res) => {
    const relatorio = await pedidosFunerais.generateRelatorioPedido(req.params.id);
    if (relatorio) {
        res.status(200).json(relatorio);
    } else {
        res.status(404).json({ message: 'Pedido não encontrado' });
    }
});

//-----------------------------------------------------------Guia Médico-----------------------------------------------------------------------//
app.get('/api/guiasMedicos', verificarToken, async (req, res) => {
    try {
        const guias = await guiaMedico.getGuiasMedicos();
        if (guias) {
            res.status(200).json(guias);
        } else {
            res.status(404).json({ message: 'Nenhum guia médica encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar guias médicas' });
    }
});

app.get('/api/guiasMedicos/:id', verificarToken, async (req, res) => {
    try {
        const guia = await guiaMedico.getGuiaMedico(req.params.id);
        if (guia) {
            res.status(200).json(guia);
        } else {
            res.status(404).json({ message: 'Guia médica não encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar guia médica' });
    }
});

app.get('/api/guiasMedicos/user/:id', verificarToken, async (req, res) => {
    try {
        const guias = await guiaMedico.getGuiasMedicosByUserId(req.params.id);
        if (guias) {
            res.status(200).json(guias);
        } else {
            res.status(404).json({ message: 'Nenhum guia médico encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar guias médicos' });
    }
});


app.post('/api/guiasMedicos', verificarToken, async (req, res) => {
    try {
        const data = req.body;
        const guia = await guiaMedico.addGuiaMedico(data);
        if (guia) {
            res.status(201).json({ message: 'Guia médico criado com sucesso', guia });
        } else {
            res.status(500).json({ message: 'Erro ao criar guia médico' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar guia médico' });
    }
});

app.put('/api/guiasMedicos/:id', verificarToken, async (req, res) => {
    try {
        const success = await guiaMedico.updateGuiaMedico(req.body);
        if (success) {
            res.status(200).json({ message: 'Guia médico atualizado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao atualizar guia médico' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar guia médico' });
    }
});

app.delete('/api/guiasMedicos/:id', verificarToken, async (req, res) => {
    try {
        const success = await guiaMedico.deleteGuiaMedico(req.params.id);
        if (success) {
            res.status(200).json({ message: 'Guia médico deletado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao deletar guia médico' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar guia médico' });
    }
});

//------------------Departamento----------------------//

// Rota para listar todos os departamentos
app.get('/api/departamentos', verificarToken, async (req, res) => {
    try {
        const data = await departamentos.getDepartamentos();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Nenhum departamento encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar departamentos' });
    }
});

// Rota para criar um novo departamento
app.post('/api/departamentos', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const { codigo, descricao, abreviacao } = req.body;

        // Validação básica
        if (!codigo || !descricao || !abreviacao) {
            return res.status(400).json({ message: 'Os campos codigo, descricao e abreviacao são obrigatórios' });
        }

        const result = await departamentos.addDepartamento({ codigo, descricao, abreviacao });

        if (result) {
            res.status(201).json({
                message: 'Departamento criado com sucesso',
                id: result.id,
            });
        } else {
            res.status(500).json({ message: 'Erro ao criar departamento' });
        }
    } catch (error) {
        console.error("Erro ao criar departamento:", error.message);
        res.status(500).json({ message: 'Erro ao criar departamento' });
    }
});

// Rota para atualizar um departamento existente
app.put('/api/departamentos/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const { nome } = req.body;
        const id = req.params.id;
        const success = await departamentos.updateDepartamento(id, nome);
        if (success) {
            res.status(200).json({ message: 'Departamento atualizado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao atualizar departamento' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar departamento' });
    }
});

// Rota para deletar um departamento
app.delete('/api/departamentos/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const id = req.params.id;
        const success = await departamentos.deleteDepartamento(id);
        if (success) {
            res.status(200).json({ message: 'Departamento deletado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao deletar departamento' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar departamento' });
    }
});

//-----------------------------------------------------------Logs-----------------------------------------------------------------------//
app.post('/logs', verificarToken, async (req, res) => {
    try {
        const data = req.body;
        const result = await logs.addLog(data);
        if (result) {
            res.status(201).json({ message: 'Log registrado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao registrar log' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar log' });
    }
});

app.get('/logs', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {

        const dataReceived = req.query;
        const data = await logs.getLogs(dataReceived);
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ message: 'Erro ao buscar logs' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar logs' });
    }
});

app.get('/logs/user/:id', verificarToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const data = await logs.getLogsByUser(userId);
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ message: 'Erro ao buscar logs' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar logs' });
    }
});
//------------------Setores----------------------//

// Rota para listar todos os setores
app.get('/api/setores', verificarToken, async (req, res) => {
    try {
        const data = await setores.getSetores();
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Nenhum setor encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar setores' });
    }
});

// Rota para criar um novo departamento
app.post('/api/setores', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const { codigo, descricao, cobrador, comissao } = req.body;

        // Validação básica
        if (!codigo || !descricao || !cobrador || !comissao) {
            return res.status(400).json({ message: 'Os campos codigo, descricao, cobrador e comissao são obrigatórios' });
        }

        const result = await setores.addSetores({codigo, descricao, cobrador, comissao});

        if (result) {
            res.status(201).json({
                message: 'Setor criado com sucesso',
                id: result.id,
            });
        } else {
            res.status(500).json({ message: 'Erro ao criar setor' });
        }
    } catch (error) {
        console.error("Erro ao criar setor:", error.message);
        res.status(500).json({ message: 'Erro ao criar setor' });
    }
});

// Rota para atualizar um departamento existente
app.put('/api/setores/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const { descricao, cobrador, comissao } = req.body;
        const id = req.params.id;
        const success = await setores.updateSetores(id, descricao, cobrador, comissao);
        if (success) {
            res.status(200).json({ message: 'Setor atualizado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao atualizar setor' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar setor' });
    }
});

// Rota para deletar um departamento
app.delete('/api/setores/:id', verificarToken, havePermissionAdministrador, async (req, res) => {
    try {
        const id = req.params.id;
        const success = await setores.deleteSetores(id);
        if (success) {
            res.status(200).json({ message: 'Setores deletado com sucesso' });
        } else {
            res.status(500).json({ message: 'Erro ao deletar setor' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar setor' });
    }
});

//------------------Door----------------------//
const port = process.env.PORT || 6001;


const server = app.listen(port, '0.0.0.0', () => {
    console.log('Order API is running at ' + port);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
