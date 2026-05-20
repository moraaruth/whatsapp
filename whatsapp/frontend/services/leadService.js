import api from './api';

export const leadService = {
  async getAllLeads(params = {}) {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  async getLeadById(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  async updateLeadStatus(id, data) {
    const response = await api.patch(`/leads/${id}/status`, data);
    return response.data;
  },

  async addNote(id, data) {
    const response = await api.post(`/leads/${id}/note`, data);
    return response.data;
  },

  async assignLead(id, data) {
    const response = await api.post(`/leads/${id}/assign`, data);
    return response.data;
  },

  async setFollowUp(id, data) {
    const response = await api.post(`/leads/${id}/followup`, data);
    return response.data;
  },

  async searchLeads(searchTerm) {
    const response = await api.get('/leads/search', { params: { searchTerm } });
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/leads/dashboard/stats');
    return response.data;
  },

  async getMessagesForLead(id) {
    const response = await api.get(`/leads/${id}/messages`);
    return response.data;
  },

  async sendMessage(id, data) {
    const response = await api.post(`/leads/${id}/messages`, data);
    return response.data;
  },
};
