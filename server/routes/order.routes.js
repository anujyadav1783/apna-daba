const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/place', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/cancel', cancelOrder);

// Admin routes (note: handled in admin routes mostly, but we can put them here too)
// Or keep separate if admin routes file handles orders
router.get('/', adminOnly, getAllOrders);
router.patch('/:orderId/status', adminOnly, updateOrderStatus);

module.exports = router;
