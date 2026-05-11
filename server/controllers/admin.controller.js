const User = require('../models/User.model');
const Order = require('../models/Order.model');
const Subscription = require('../models/Subscription.model');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();

        // Today's orders
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysOrders = await Order.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Total Revenue (Only Delivered Orders)
        const orders = await Order.find({ status: 'delivered' });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        res.json({
            totalUsers,
            totalOrders,
            todaysOrders,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTodaysOrders = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const count = await Order.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        res.json({ count });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getUsersCount = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: 'user' });
        res.json({ count });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getActiveSubscriptions = async (req, res) => {
    try {
        const count = await Subscription.countDocuments({ isActive: true });
        res.json({ count });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const orders = await Order.find({ 
            status: 'delivered',
            createdAt: { $gte: startOfMonth }
        });
        const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        res.json({ revenue });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

