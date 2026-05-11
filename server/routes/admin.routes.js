const express = require('express');
const router = express.Router();
const { getStats, getUsers, blockUser, getTodaysOrders, getUsersCount, getActiveSubscriptions, getMonthlyRevenue } = require('../controllers/admin.controller');
const { getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/orders/today', getTodaysOrders);
router.get('/users/count', getUsersCount);
router.get('/subscriptions/active', getActiveSubscriptions);
router.get('/revenue/monthly', getMonthlyRevenue);

router.get('/users', getUsers);
router.patch('/users/:id/block', blockUser);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
