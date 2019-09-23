const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: {
        type: String,
        unique: true
    },
    prefix: String,
    channel: String,
    blocked: Array
})

module.exports = mongoose.model("GuildSettings", Schema);