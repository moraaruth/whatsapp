const LeadService = require('../services/LeadService');
const WhatsAppService = require('../services/WhatsAppService');
const Message = require('../models/Message');
const Lead = require('../models/Lead');

class LeadController {

  // ========================
  // GET ALL LEADS (SAFE)
  // ========================
  async getAllLeads(req, res) {
    try {
      const { status, priority, page = 1, limit = 20 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // SAFE: direct DB query (NO dependency on broken service)
      const query = Lead.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const leads = await query;

      const total = await Lead.countDocuments(filters);

      return res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // GET ONE LEAD
  // ========================
  async getLeadById(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: lead,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // UPDATE STATUS
  // ========================
  async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const allowed = ['NEW', 'CONTACTED', 'INTERESTED', 'CLOSED', 'LOST'];

      if (!status || !allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }

      const lead = await Lead.findByIdAndUpdate(
        id,
        {
          status,
          ...(notes && { $push: { notes: notes } }),
          updatedAt: new Date(),
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: lead,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // ADD NOTE
  // ========================
  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Note text required',
        });
      }

      const lead = await Lead.findByIdAndUpdate(
        id,
        {
          $push: {
            notes: {
              text,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Note added',
        data: lead,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // ASSIGN LEAD
  // ========================
  async assignLead(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const lead = await Lead.findByIdAndUpdate(
        id,
        { assignedTo: userId },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Lead assigned',
        data: lead,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // FOLLOW UP
  // ========================
  async setFollowUp(req, res) {
    try {
      const { id } = req.params;
      const { followUpDate } = req.body;

      if (!followUpDate) {
        return res.status(400).json({
          success: false,
          message: 'Follow-up date required',
        });
      }

      const lead = await Lead.findByIdAndUpdate(
        id,
        { followUpDate: new Date(followUpDate) },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Follow-up set',
        data: lead,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // SEARCH LEADS (FIXED)
  // ========================
  async searchLeads(req, res) {
    try {
      const { searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term required',
        });
      }

      const leads = await Lead.find({
        $or: [
          { phoneNumber: { $regex: searchTerm, $options: 'i' } },
          { name: { $regex: searchTerm, $options: 'i' } },
        ],
      });

      return res.status(200).json({
        success: true,
        data: leads,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ========================
  // DASHBOARD STATS (SAFE)
  // ========================
  async getDashboardStats(req, res) {
    try {
      const total = await Lead.countDocuments();
      const newLeads = await Lead.countDocuments({ status: 'NEW' });
      const contacted = await Lead.countDocuments({ status: 'CONTACTED' });

      return res.status(200).json({
        success: true,
        data: {
          total,
          newLeads,
          contacted,
        },
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LeadController();