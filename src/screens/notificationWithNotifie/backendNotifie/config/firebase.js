const firebase = require("firebase-admin");

var citoyenServiceAccount = require("djdsjhdjhjkds/ijsdijsio");
const { cachedDataVersionTag } = require("v8");

const maCite = firebase.initializeApp({
          credential: firebase.credential.cert(citoyenServiceAccount)
}, 'maCite');

module.exports = {
        maCite,
}