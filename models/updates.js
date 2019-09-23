const mongoose = require("mongoose");

const Schema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    targetName: String,
    name: String,
    sex: String,
    franch: String,
    images: String,
    category: Number,
    description: String,
    date: {
        type: Date,
        unique: true
    }
})

module.exports = mongoose.model("Updates", Schema);