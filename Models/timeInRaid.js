const { model, Schema } = require('mongoose')

let timeInRaid = new Schema({
    Userid: String,
    Time: String,
    Join: String,
})

module.exports = model('timeinraid', timeInRaid)