const Cart = require('../models/Cart.model');
const Food = require('../models/Food.model');

// Helper to calculate total amount
const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.foodId');
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [], totalAmount: 0 });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        // Find food to get details
        const food = await Food.findById(foodId);
        if (!food) return res.status(404).json({ message: 'Food item not found' });

        // Fetch user cart
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [], totalAmount: 0 });
        }

        // Check if item already exists
        const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: quantity,
                image: food.image
            });
        }

        cart.totalAmount = calculateTotal(cart.items);
        await cart.save();

        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.totalAmount = calculateTotal(cart.items);
            await cart.save();
            res.json({ message: 'Cart updated', cart });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const foodId = req.params.foodId;
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
        cart.totalAmount = calculateTotal(cart.items);
        await cart.save();

        res.json({ message: 'Item removed', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
        }
        res.json({ message: 'Cart cleared', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
