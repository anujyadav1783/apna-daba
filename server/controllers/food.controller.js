const Food = require('../models/Food.model');

exports.getFoods = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.foodType) filter.foodType = req.query.foodType;

        const foods = await Food.find(filter);
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ message: 'Food item not found' });
        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPopularFoods = async (req, res) => {
    try {
        const foods = await Food.find({ isPopular: true });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addFood = async (req, res) => {
    try {
        // If we use multer later, req.file.path would be used for image
        const foodData = { ...req.body };
        if (req.file) {
            foodData.image = `/uploads/${req.file.filename}`;
        }
        const food = await Food.create(foodData);
        res.status(201).json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFood = async (req, res) => {
    try {
        const foodData = { ...req.body };
        if (req.file) {
            foodData.image = `/uploads/${req.file.filename}`;
        }
        const food = await Food.findByIdAndUpdate(req.params.id, foodData, { new: true });
        if (!food) return res.status(404).json({ message: 'Food item not found' });
        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);
        if (!food) return res.status(404).json({ message: 'Food item not found' });
        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleAvailability = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ message: 'Food item not found' });

        food.isAvailable = !food.isAvailable;
        await food.save();
        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
