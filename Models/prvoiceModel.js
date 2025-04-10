const {model, Schema} = require('mongoose')

let prv = new Schema({
    User: String,
    Username: String,
    Voice: String,
    Logmsg: String,
    Role: String,
    Members: Array
})

module.exports = model("prvoice", prv)