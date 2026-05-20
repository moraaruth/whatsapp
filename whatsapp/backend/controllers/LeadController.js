const LeadService = require('../services/LeadService');
const WhatsAppService = require('../services/WhatsAppService');
const Message = require('../models/Message');
const Lead = require('../models/Lead');

class LeadController {
  async getAllLeads(req, res) {
    try {
      const userId = req.user.id;
      const { status, priority, page = 1, limit = 20 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const leads = await LeadService.getLeadsByUser(userId, filters);

      // Calculate pagination
      const total = leads.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLeads = leads.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: paginatedLeads,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLeadById(req, res) {
    try {
      const { id } = req.params;
      const lead = await LeadService.getLeadById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status || !['NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid status',
        });
      }

      const lead = await LeadService.updateLeadStatus(
        id,
        status,
        req.user.id,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'Lead status updated successfully',
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Please provide note text',
        });
      }

      const lead = await LeadService.addNoteToLead(id, text, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Note added successfully',
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async assignLead(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const lead = await LeadService.assignLead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Lead assigned successfully',
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async setFollowUp(req, res) {
    try {
      const { id } = req.params;
      const { followUpDate } = req.body;

      if (!followUpDate) {
        return res.status(400).json({
          success: false,
          message: 'Please provide follow-up date',
        });
      }

      const lead = await LeadService.setFollowUp(id, new Date(followUpDate), req.user.id);

      res.status(200).json({
        success: true,
        message: 'Follow-up set successfully',
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchLeads(req, res) {
    try {
      const { searchTerm } = req.query;
      const userId = req.user.id;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Please provide search term',
        });
      }

      const leads = await LeadService.searchLeads(userId, searchTerm);

      res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await LeadService.getDashboardStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LeadController();
