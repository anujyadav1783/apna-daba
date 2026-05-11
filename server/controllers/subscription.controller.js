const Subscription = require('../models/Subscription.model');

// Predefined plans as requested
const PLANS = {
    starter: { price: 2499, mealsPerDay: 1, features: { chapatiCount: 4, customization: false, weekendMeals: false, priorityDelivery: false } },
    regular: { price: 3999, mealsPerDay: 2, features: { chapatiCount: 6, customization: true, weekendMeals: false, priorityDelivery: false } },
    premium: { price: 5499, mealsPerDay: 3, features: { chapatiCount: 8, customization: true, weekendMeals: true, priorityDelivery: true } },
};

exports.getPlans = (req, res) => {
    res.json(PLANS);
};

exports.subscribe = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Check existing active subscription
        const existing = await Subscription.findOne({ userId: req.user.id, isActive: true });
        if (existing) {
            return res.status(400).json({ message: 'You already have an active subscription' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const subscription = await Subscription.create({
            userId: req.user.id,
            plan,
            price: PLANS[plan].price,
            mealsPerDay: PLANS[plan].mealsPerDay,
            startDate,
            endDate,
            features: PLANS[plan].features
        });

        res.status(201).json({ message: `Successfully subscribed to ${plan} plan!`, subscription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMySubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ userId: req.user.id, isActive: true });
        if (!subscription) {
            return res.json({ isActive: false }); // Returning graceful response if none actively
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ userId: req.user.id, isActive: true });
        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found to cancel' });
        }

        subscription.isActive = false;
        subscription.autoRenew = false;
        await subscription.save();

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate('userId', 'fullName email phone');
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
