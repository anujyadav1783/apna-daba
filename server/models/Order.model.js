const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [{
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
    }],
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    deliveryAddress: { type: String, required: true },
    status: {
        type: String,
        enum: ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'confirmed'
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    estimatedTime: { type: String, default: '30 mins' },
    deliveredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
