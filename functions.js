function uniKey(length = 10) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function typeReturn(type) {
    let message;
    switch (type) {
        case 1:
            message = `Pax Nippon: A sua mensalidade vence hoje. Efetue o pagamento agora mesmo`
            break;
        case 2:
            message = `Pax Nippon: A sua mensalidade vence hoje. Efetue o pagamento agora mesmo`
            break;
        case 3:
            message = `Pax Nippon: A sua mensalidade vence hoje. Efetue o pagamento agora mesmo`
    }
    return message;
}

function formatDate(inputDate) {
    // Parse the input date in the format "DD/MM/YYYY"
    const parts = inputDate.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const year = parseInt(parts[2], 10);

    // Create a Date object
    const dateObject = new Date(year, month, day);

    // Format the date as "YYYY-MM-DD"
    const formattedDate = dateObject.toISOString().split('T')[0];

    return formattedDate;
}

function limparNumero(numero) {
    // Remover caracteres especiais
    const numeroSemEspeciais = numero.replace(/[^\d]/g, '');

    // Remover espaços
    const numeroSemEspacos = numeroSemEspeciais.replace(/\s/g, '');

    return numeroSemEspacos;
}

function adicionarDias(data, dias) {
    const dataAtual = new Date(data);
    const dataFutura = new Date(dataAtual.getTime() + dias * 24 * 60 * 60 * 1000);

    // Formatar a data no formato "YYYY-MM-DD"
    const ano = dataFutura.getFullYear();
    const mes = (dataFutura.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataFutura.getDate().toString().padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function diaAmanhaString() {
    // Obtém a data atual em milissegundos
    const currentDate = new Date().getTime();

    // Adiciona um dia (em milissegundos) à data atual
    const oneDay = 1000 * 60 * 60 * 24;
    const expireDate = new Date(currentDate + oneDay);

    // Formata a data para 'YYYY-MM-DD'
    const year = expireDate.getFullYear();
    const month = String(expireDate.getMonth() + 1).padStart(2, '0');
    const day = String(expireDate.getDate()).padStart(2, '0');
    const expireDateFormatted = `${year}-${month}-${day}`;

    return expireDateFormatted;

}

function formatarTimestamp(timestamp) {
    // Extrai os segundos do timestamp
    const segundos = timestamp.seconds;
  
    // Cria um objeto Date com os segundos fornecidos
    const data = new Date(segundos * 1000); // Multiplica por 1000 para converter segundos em milissegundos
    
    // Extrai o dia, mês e ano da data
    const dia = data.getDate();
    const mes = data.getMonth() + 1; // Os meses começam do zero, então adicionamos 1
    const ano = data.getFullYear();
    
    // Formata o dia e mês para terem sempre dois dígitos
    const diaFormatado = dia < 10 ? '0' + dia : dia;
    const mesFormatado = mes < 10 ? '0' + mes : mes;
    
    // Retorna a data formatada no formato desejado (dia/mês/ano)
    return diaFormatado + '/' + mesFormatado + '/' + ano;
  }
  

function numberAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função que retorna a data atual formatada como "DD/MM/AAAA"
function obterDataFormatadaHoje() {
    // Cria um objeto Date representando a data e hora atuais
    const dataAtual = new Date();
    
    // Extrai o dia, mês e ano da data atual
    const dia = dataAtual.getDate();
    const mes = dataAtual.getMonth() + 1; // Os meses começam do zero, então adicionamos 1
    const ano = dataAtual.getFullYear();
    
    // Formata o dia e mês para terem sempre dois dígitos
    const diaFormatado = dia < 10 ? '0' + dia : dia;
    const mesFormatado = mes < 10 ? '0' + mes : mes;
    
    // Retorna a data formatada no formato desejado (dia/mês/ano)
    return diaFormatado + '/' + mesFormatado + '/' + ano;
  }
  

  

module.exports = { uniKey, typeReturn, formatarTimestamp, formatDate, limparNumero, adicionarDias, diaAmanhaString, obterDataFormatadaHoje, numberAleatorio};