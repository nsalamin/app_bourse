const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    id: String,
    prices: [Number]
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;