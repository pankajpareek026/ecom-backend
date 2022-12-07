const mongoose = require('mongoose')
const productsSchema = mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    company: String,
    quantity: Number,
    userId: String,


})
module.exports = mongoose.model('products', productsSchema)