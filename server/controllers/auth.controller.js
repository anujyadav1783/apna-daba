const User = require('../models/User.model');
const Order = require('../models/Order.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate strict DB stats for user isolation
const getUserStats = async (userId) => {
    try {
        const orders = await Order.find({ userId: userId });
        const totalOrders = orders.length;
        const monthlyExpenses = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        return {
            memberType: 'Standard',
            healthScore: 100, // Default baseline for all accounts
            savedTime: totalOrders * 1.5, // 1.5 hours of cooking saved per order
            monthlyExpenses,
            totalOrders,
            loyaltyPoints: Math.floor(monthlyExpenses / 100),
            subscription: 'inactive',
            suggestedMeal: 'Discover our Menu'
        };
    } catch (err) {
        console.error("Error fetching user stats:", err);
        return {
            memberType: 'Standard', healthScore: 100, savedTime: 0,
            monthlyExpenses: 0, totalOrders: 0, loyaltyPoints: 0,
            subscription: 'inactive', suggestedMeal: 'Discover our Menu'
        };
    }
};

exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, password, userType } = req.body;

        // Check existing
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            fullName,
            email,
            phone,
            password: hashed,
            userType
        });

        // Strictly do NOT auto-login user upon signup
        res.status(201).json({
            message: 'User created successfully. Please login.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        const userStats = await getUserStats(user._id);

        res.json({
            token,
            user: { id: user._id, fullName: user.fullName, name: user.fullName, email, role: user.role, ...userStats }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        const userStats = await getUserStats(user._id);
        res.json({ ...user, name: user.fullName, ...userStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
