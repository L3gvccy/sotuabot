const {model, Schema} = require('mongoose')

let repSchema = new Schema({
    User: String,
    Username: String,
    Desc: String,
    Title: String,
    Plus: Array,
    Minus: Array
})

module.exports = model("reputation", repSchema)