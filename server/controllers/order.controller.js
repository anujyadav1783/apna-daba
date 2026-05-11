const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');

const generateOrderNumber = () => {
    const prefix = 'AD';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
};

exports.placeOrder = async (req, res) => {
    try {
        const { deliveryAddress, paymentMethod } = req.body;

        // Get user cart
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderNumber = generateOrderNumber();
        const deliveryFee = 30;
        const finalTotal = cart.totalAmount + deliveryFee;

        const order = await Order.create({
            userId: req.user.id,
            orderNumber,
            items: cart.items,
            totalAmount: finalTotal,
            deliveryFee,
            deliveryAddress: deliveryAddress || req.user.address,
            paymentMethod: paymentMethod || 'cod',
        });

        // Clear cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        // If param is a valid order ID vs Object ID
        // Frontend sends orderNumber in track-order link like ?orderId=AD4782
        let order;
        if (req.params.orderId.startsWith('AD')) {
            order = await Order.findOne({ orderNumber: req.params.orderId });
        } else {
            order = await Order.findById(req.params.orderId);
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Ensure the order belongs to the user or user is admin
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: `Cannot cancel order in ${order.status} state` });
        }

        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin endpoints
exports.getAllOrders = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const orders = await Order.find(filter)
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status === 'delivered') order.deliveredAt = Date.now();
        await order.save();

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
