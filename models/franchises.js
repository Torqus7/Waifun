const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    targetName: String,
    name: {
        type: String,
        unique: true
    },
    characters: Array,
    fromAnimeManga: Number,
    fromGames: Number,
    fromCartoonsComics: Number,
    fromInternetYoutube: Number,
    thumbnail: String
})

module.exports = mongoose.model("Franchises", Schema);