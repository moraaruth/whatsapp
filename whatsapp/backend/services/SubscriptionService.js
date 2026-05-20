const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const config = require('../config/config');

class SubscriptionService {
  async createSubscription(userId, mpesaTransactionId, mpesaPhoneNumber, plan = 'BASIC') {
    const subscription = new Subscription({
      userId,
      plan,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      monthlyPrice: config.subscription.monthlyPriceKES,
      mpesaTransactionId,
      mpesaPhoneNumber,
      autoRenew: true,
    });

    await subscription.save();

    // Create notification
    await Notification.create({
      userId,
      type: 'INFO',
      title: 'Subscription Activated',
      message: 'Your WhatsApp Lead Tracker subscription has been activated successfully.',
      isRead: false,
      relatedSubscriptionId: subscription._id,
    });

    return subscription;
  }

  async updateSubscriptionStatus(subscriptionId, newStatus) {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const oldStatus = subscription.status;
    subscription.status = newStatus;
    subscription.updatedAt = new Date();

    if (newStatus === 'EXPIRED') {
      subscription.endDate = new Date();
    }

    await subscription.save();

    // Create notification
    await Notification.create({
      userId: subscription.userId,
      type: 'ALERT',
      title: `Subscription ${newStatus}`,
      message: `Your subscription has been ${newStatus.toLowerCase()}.`,
      isRead: false,
      relatedSubscriptionId: subscription._id,
    });

    return subscription;
  }

  async getSubscriptionByUserId(userId) {
    return await Subscription.findOne({ userId })
      .sort({ createdAt: -1 });
  }

  async checkSubscriptionStatus(userId) {
    const subscription = await this.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return {
        isActive: false,
        isTrial: true,
        trialEndsAt: new Date(Date.now() + config.subscription.trialDays * 24 * 60 * 60 * 1000),
        plan: 'BASIC',
      };
    }

    const now = new Date();
    const isActive = subscription.status === 'ACTIVE' && (!subscription.endDate || subscription.endDate > now);
    const isTrial = subscription.status === 'TRIAL' && (!subscription.trialEndsAt || subscription.trialEndsAt > now);

    return {
      isActive,
      isTrial,
      trialEndsAt: subscription.trialEndsAt,
      plan: subscription.plan,
      status: subscription.status,
      monthlyPrice: subscription.monthlyPrice,
    };
  }

  async createRenewalNotification(subscriptionId) {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const notification = new Notification({
      userId: subscription.userId,
      type: 'PAYMENT',
      title: 'Subscription Renewal Due',
      message: `Your ${subscription.plan} plan subscription will expire on ${subscription.endDate.toDateString()}. Please renew to continue using WhatsApp Lead Tracker.`,
      isRead: false,
      relatedSubscriptionId: subscription._id,
    });

    await notification.save();

    return notification;
  }

  async processMpesaPaymentCallback(result) {
    const { success, transactionId, amount, phoneNumber, status } = result;

    if (!success) {
      console.log('M-Pesa payment failed:', result.errorMessage);
      return null;
    }

    // Find subscription by transaction ID or phone number
    let subscription = await Subscription.findOne({
      $or: [
        { mpesaTransactionId: transactionId },
        { mpesaPhoneNumber: phoneNumber, status: 'PENDING' },
      ],
    });

    if (!subscription) {
      // Try to find user by phone number
      const user = await User.findOne({ phoneNumber });
      
      if (user) {
        // Create new subscription
        subscription = await this.createSubscription(
          user._id,
          transactionId,
          phoneNumber,
          amount >= 3000 ? 'ENTERPRISE' : amount >= 1500 ? 'PRO' : 'BASIC'
        );
      }
    } else {
      // Update existing subscription
      subscription.status = 'ACTIVE';
      subscription.startDate = new Date();
      subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscription.mpesaTransactionId = transactionId;
      await subscription.save();
    }

    return subscription;
  }

  async cancelSubscription(subscriptionId, userId) {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'CANCELLED';
    subscription.updatedAt = new Date();
    await subscription.save();

    return subscription;
  }

  async getAllSubscriptions(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }

    return await Subscription.find(query)
      .populate('userId', 'firstName lastName email phoneNumber company')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getRevenueStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const subscriptions = await Subscription.find({
      status: 'ACTIVE',
      startDate: { $gte: startOfMonth },
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0);
    const activeSubscriptions = subscriptions.length;

    return {
      totalRevenue,
      activeSubscriptions,
      period: 'current_month',
    };
  }
}

module.exports = new SubscriptionService();
