const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        unique: true
    },
    characters: Array,
    objects: Array,
    events: Array,
    team: Array,
    teamUpdated: Boolean,
    getUses: Number,
    spawnUses: Number,
    sleeves: Number,
    goldSleeves: Number,
    voteTime: Date,
    voteUses: Boolean,
    patreon: Boolean,
    patreonBonuses: Number,
    leveling: String,
    favorite: String
})

module.exports = mongoose.model("UserInventories", Schema);