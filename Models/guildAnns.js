const { model, Schema } = require('mongoose')

let guildanns = new Schema ({
    Author: String,
    Thread: String,
    Message: String
})

module.exports = model('guildAnns', guildanns)