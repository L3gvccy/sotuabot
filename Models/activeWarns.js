const { model, Schema } = require('mongoose')

let activeWarns = new Schema({
    Userid: String,
    Usertag: String,
})

module.exports = model('activewarns', activeWarns)