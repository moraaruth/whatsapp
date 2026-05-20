const MpesaService = require('../services/MpesaService');
const SubscriptionService = require('../services/SubscriptionService');
const User = require('../models/User');

class MpesaController {
  async stkPush(req, res) {
    try {
      const { phoneNumber, amount, plan = 'BASIC' } = req.body;

      // Validate inputs
      if (!phoneNumber || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Please provide phone number and amount',
        });
      }

      // Validate amount
      const validAmounts = [1000, 1500, 3000];
      if (!validAmounts.includes(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount. Valid amounts are: 1000, 1500, 3000',
        });
      }

      // Check if user exists
      const user = await User.findOne({ phoneNumber });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.',
        });
      }

      // Check subscription status
      const subscriptionService = require('../services/SubscriptionService');
      const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(user._id);

      if (subscriptionStatus.isActive) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active subscription',
        });
      }

      // Initiate STK push
      const result = await MpesaService.stkPush(
        phoneNumber,
        amount,
        'WhatsAppLeadTracker',
        'CustomerBuyGoodsOnline'
      );

      // Create pending subscription
      await SubscriptionService.createSubscription(
        user._id,
        null,
        phoneNumber,
        plan
      );

      res.status(200).json({
        success: true,
        message: 'STK push initiated successfully',
        data: result,
      });
    } catch (error) {
      console.error('STK Push Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initiate payment',
      });
    }
  }

  async webhook(req, res) {
    try {
      const { Body } = req.body;

      if (!Body) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      const mpesaResult = Body.stkCallback;
      
      if (!mpesaResult) {
        return res.status(400).json({
          success: false,
          message: 'Invalid callback data',
        });
      }

      // Validate payment
      const result = await MpesaService.validateMpesaPayment(mpesaResult);

      if (result.success) {
        // Process subscription
        const subscription = await SubscriptionService.processMpesaPaymentCallback(result);

        if (subscription) {
          console.log(`Payment processed for subscription: ${subscription._id}`);
        }
      } else {
        console.log('Payment failed:', result.errorMessage);
      }

      // Always respond 200 to acknowledge receipt
      res.status(200).json({
        success: true,
        message: 'Webhook received',
        data: result,
      });
    } catch (error) {
      console.error('M-Pesa Webhook Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing webhook',
      });
    }
  }

  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.user.id;
      const status = await SubscriptionService.checkSubscriptionStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      const subscription = await SubscriptionService.cancelSubscription(subscriptionId, userId);

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MpesaController();
