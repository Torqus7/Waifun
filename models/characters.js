const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        unique: true
    },
    sex: { type: Number, index: true },
    franch: String,
    images: String,
    category: Number,
    description: String,
    popularity: Number,
    createdBy: String
})

module.exports = mongoose.model("Characters", Schema);