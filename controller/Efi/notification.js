const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')
const {getMensalidadeCarne} = require('../mensalidades')



const getNotification = async (data) => {
    const efipay = new EfiPay(options)
    efipay.getNotification(data)
        .then((resposta) => {
                getMensalidadeCarne(resposta);
                return resposta;
        })
        .catch((error) => {
            console.log(error)
        })
}


 module.exports = { getNotification };
