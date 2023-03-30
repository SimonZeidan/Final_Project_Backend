const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
    cartItems: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
})

module.exports = mongoose.model('Cart', cartSchema);