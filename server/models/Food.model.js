const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['thali', 'rice', 'roti', 'breakfast', 'snacks'], required: true },
    foodType: { type: String, enum: ['veg', 'non-veg'], required: true },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    calories: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);
