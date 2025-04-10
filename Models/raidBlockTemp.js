const { model, Schema } = require('mongoose')

let raidblocktemp = new Schema({
    Userid: String,
    Xbox: String,
    Till: Date,
})

module.exports = model('raidblocktemp', raidblocktemp)