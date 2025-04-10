const {model, Schema} = require('mongoose')

let savedRoles = new Schema({
    Member: String,
    Nickname: String,
    Roles: String
})

module.exports = model("SaveRoles", savedRoles)