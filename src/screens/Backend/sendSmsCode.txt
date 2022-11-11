const { query } = require('./db')

const axios = require('axios').default

module.exports = async function sendSMS(USER_ID, TELEPHONE, MESSAGE, NUMERO_PLAQUE, IS_AGENT_PSR = null, ID_PSR_ELEMENT = null) {
          if(!TELEPHONE) return false
          const response = await axios.post('http://51.83.236.148:3030/sms', {
                    txt_message: MESSAGE,
                    phone: TELEPHONE
          })
          await query('INSERT INTO notifications(USER_ID, MESSAGE, TELEPHONE, NUMERO_PLAQUE, IS_AGENT_PSR, ID_PSR_ELEMENT, STATUT) VALUES(?, ?, ?, ?, ?, ?, ?)', [
                    USER_ID, MESSAGE, TELEPHONE, NUMERO_PLAQUE, IS_AGENT_PSR, ID_PSR_ELEMENT, 1
          ])
}