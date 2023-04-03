const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    imageUrl: {
        type: String,
    }
})


module.exports = mongoose.model('Item', itemSchema);
