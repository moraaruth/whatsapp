import api from './api';

export const mpesaService = {
  async initiatePayment(data) {
    const response = await api.post('/mpesa/stkpush', data);
    return response.data;
  },

  async getSubscriptionStatus() {
    const response = await api.get('/mpesa/subscription/status');
    return response.data;
  },

  async cancelSubscription(subscriptionId) {
    const response = await api.post(`/mpesa/subscription/${subscriptionId}/cancel`);
    return response.data;
  },
};
