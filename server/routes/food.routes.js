const express = require('express');
const router = express.Router();
const { getFoods, getFood, getPopularFoods, addFood, updateFood, deleteFood, toggleAvailability } = require('../controllers/food.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public
router.get('/', getFoods);
router.get('/popular', getPopularFoods); // Put this above /:id to avoid matching issues
router.get('/:id', getFood);

// Admin Only
router.post('/', protect, adminOnly, addFood); // Extend with multer later if needed
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);
router.patch('/:id/toggle', protect, adminOnly, toggleAvailability);

module.exports = router;
