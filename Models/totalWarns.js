const { model, Schema } = require('mongoose')

let totalWarns = new Schema({
    Userid: String,
    Usertag: String,
    Warns: Number
})

module.exports = model('totalwarns', totalWarns)