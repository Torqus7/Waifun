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
    uses: Number
})

module.exports = mongoose.model("Objects", Schema);