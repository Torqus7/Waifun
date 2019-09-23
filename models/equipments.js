const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        unique: true
    },
    quality: { type: Number, index: true },
    image: String,
    franch: String,
    description: String,
    power: Number
})

module.exports = mongoose.model("Equipments", Schema);