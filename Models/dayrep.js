const {model, Schema} = require('mongoose')

let dayrep = new Schema({
    User: String,
    Votes: Array
})

module.exports = model("dayrep", dayrep)