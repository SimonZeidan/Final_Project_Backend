const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    }
})


module.exports = mongoose.model('Item', itemSchema);
