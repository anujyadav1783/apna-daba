const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1, min: 1 },
    image: { type: String },
});

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
