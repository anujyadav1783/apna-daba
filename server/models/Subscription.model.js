const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['starter', 'regular', 'premium'], required: true },
    price: { type: Number, required: true },
    mealsPerDay: { type: Number },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: false },
    features: {
        chapatiCount: Number,
        customization: Boolean,
        weekendMeals: Boolean,
        priorityDelivery: Boolean,
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
