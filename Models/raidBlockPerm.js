const { model, Schema } = require('mongoose')

let raidblockperm = new Schema({
    Userid: String,
    Xbox: String,
})

module.exports = model('raidblockperm', raidblockperm)