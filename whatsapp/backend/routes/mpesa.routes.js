const express = require('express');
const router = express.Router();
const MpesaController = require('../controllers/MpesaController');
const { protect } = require('../middleware/auth');

// @route   POST /api/mpesa/stkpush
// @desc    Initiate M-Pesa STK push for subscription payment
// @access  Private
router.post('/stkpush', protect, MpesaController.stkPush);

// @route   POST /api/mpesa/webhook
// @desc    M-Pesa callback webhook
// @access  Public (M-Pesa will call this)
router.post('/webhook', MpesaController.webhook);

// @route   GET /api/mpesa/subscription/status
// @desc    Get user's subscription status
// @access  Private
router.get('/subscription/status', protect, MpesaController.getSubscriptionStatus);

// @route   POST /api/mpesa/subscription/:subscriptionId/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/subscription/:subscriptionId/cancel', protect, MpesaController.cancelSubscription);

module.exports = router;
