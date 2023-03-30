const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = new mongoose.Schema({
    orderOwner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    orderRestaurant: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant'
    },
    totalPrice: {
        type: Number
    },
    menu:[{
            type: Schema.Types.ObjectId,
            ref: 'Menu'
        }],
   cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
   }
},
{timestamps: true});

module.exports = mongoose.model('Order', orderSchema);