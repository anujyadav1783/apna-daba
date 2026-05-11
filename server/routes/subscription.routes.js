const express = require('express');
const router = express.Router();
const { getPlans, subscribe, getMySubscription, cancelSubscription, getAllSubscriptions } = require('../controllers/subscription.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Public
router.get('/plans', getPlans);

// Protected
router.use(protect);
router.post('/subscribe', subscribe);
router.get('/my', getMySubscription);
router.patch('/cancel', cancelSubscription);

// Admin
router.get('/', adminOnly, getAllSubscriptions);

module.exports = router;
