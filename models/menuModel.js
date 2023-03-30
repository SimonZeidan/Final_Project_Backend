const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const menuSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
    },
    menuPicture: {
        type: String
    },
    menuItems: [{
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        }]
});

module.exports = mongoose.model('Menu', menuSchema);