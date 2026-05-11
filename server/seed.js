require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
const Food = require('./models/Food.model');

// Seed 10 food items
const seedFoods = [
    { name: 'Dal Makhani Thali', description: 'Creamy dal makhani with 3 rotis, rice and salad.', category: 'thali', foodType: 'veg', price: 129, isPopular: true },
    { name: 'Paneer Butter Masala', description: 'Rich creamy cottage cheese curry with 2 parathas.', category: 'roti', foodType: 'veg', price: 149, isPopular: true },
    { name: 'Rajma Chawal', description: 'Classic red kidney beans curry with steamed rice.', category: 'rice', foodType: 'veg', price: 109, isPopular: false },
    { name: 'Aloo Paratha', description: '2 stuffed potato flatbreads served with curd.', category: 'breakfast', foodType: 'veg', price: 89, isPopular: false },
    { name: 'Veg Biryani Bowl', description: 'Aromatic basmati rice cooked with fresh veggies and spices.', category: 'rice', foodType: 'veg', price: 139, isPopular: true },
    { name: 'Chana Masala Thali', description: 'Spicy chickpea curry with 3 rotis, rice and salad.', category: 'thali', foodType: 'veg', price: 119, isPopular: false },
    { name: 'Poha Upma Combo', description: 'Healthy breakfast combo with peanut poha and veg upma.', category: 'breakfast', foodType: 'veg', price: 69, isPopular: true },
    { name: 'Chicken Curry Thali', description: 'Home-style chicken curry with 3 rotis, rice and salad.', category: 'thali', foodType: 'non-veg', price: 179, isPopular: false },
    { name: 'Egg Bhurji Roll', description: 'Spiced scrambled eggs rolled in a soft paratha.', category: 'snacks', foodType: 'non-veg', price: 99, isPopular: false },
    { name: 'Mix Veg Sabzi Roti', description: 'Daily special mix veg sabzi served with 4 phulkas.', category: 'roti', foodType: 'veg', price: 99, isPopular: false },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected to seed...');

        // Clear existing
        await User.deleteMany();
        await Food.deleteMany();

        // Insert Foods
        await Food.insertMany(seedFoods);
        console.log('Foods seeded!');

        // Indsert Admin
        const hashed = await bcrypt.hash('Admin@123', 12);
        await User.create({
            fullName: 'Apna Dabba Admin',
            email: 'admin@apnadabba.in',
            phone: '9876543210',
            password: hashed,
            role: 'admin'
        });
        console.log('Admin seeded!');

        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

seedDB();
