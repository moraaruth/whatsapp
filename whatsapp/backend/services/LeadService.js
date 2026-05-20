const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Message = require('../models/Message');
const LeadStatusHistory = require('../models/LeadStatusHistory');
const Subscription = require('../models/Subscription');
const Analytics = require('../models/Analytics');
const { v4: uuidv4 } = require('uuid');

class LeadService {
  async createLeadFromMessage(phoneNumber, messageText, senderName = null) {
    // Check if lead already exists
    let lead = await Lead.findOne({ phoneNumber });
    
    const isNewLead = !lead;
    
    if (!lead) {
      // Create new lead
      lead = new Lead({
        phoneNumber,
        name: senderName || phoneNumber,
        status: 'NEW',
        source: 'WHATSAPP',
      });
    } else {
      // Update existing lead
      lead.updatedAt = Date.now();
    }

    // Save lead
    await lead.save();

    // Create message
    const message = new Message({
      leadId: lead._id,
      sender: 'customer',
      phoneNumber,
      messageText,
      messageId: uuidv4(),
      timestamp: new Date(),
    });

    await message.save();

    // Update analytics
    await this.updateAnalytics(lead._id, 'NEW');

    // If new lead, create status history
    if (isNewLead) {
      await LeadStatusHistory.create({
        leadId: lead._id,
        fromStatus: 'NONE',
        toStatus: 'NEW',
        timestamp: new Date(),
      });
    }

    return { lead, message, isNewLead };
  }

  async updateLeadStatus(leadId, newStatus, changedBy, notes = null) {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    const oldStatus = lead.status;
    
    if (oldStatus === newStatus) {
      return lead;
    }

    // Update lead
    lead.status = newStatus;
    lead.updatedAt = Date.now();

    if (newStatus === 'CLOSED') {
      lead.closedAt = new Date();
    } else if (newStatus === 'LOST') {
      lead.lostReason = notes || lead.lostReason;
    }

    await lead.save();

    // Create status history
    await LeadStatusHistory.create({
      leadId: lead._id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: changedBy || null,
      notes,
      timestamp: new Date(),
    });

    // Update analytics
    await this.updateAnalytics(lead._id, newStatus, oldStatus);

    return lead;
  }

  async addNoteToLead(leadId, text, createdBy) {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    lead.notes.push({
      text,
      createdBy,
      createdAt: new Date(),
    });

    lead.updatedAt = Date.now();
    await lead.save();

    return lead;
  }

  async getLeadById(leadId) {
    return await Lead.findById(leadId)
      .populate('assignedTo', 'firstName lastName email')
      .lean();
  }

  async getLeadsByUser(userId, filters = {}) {
    const query = { assignedTo: userId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }

    return await Lead.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName email')
      .lean();
  }

  async getMessagesForLead(leadId) {
    return await Message.find({ leadId })
      .sort({ timestamp: 1 })
      .lean();
  }

  async updateAnalytics(leadId, newStatus, oldStatus = null) {
    const lead = await Lead.findById(leadId);
    if (!lead) return;

    const userId = lead.assignedTo;
    if (!userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({
      userId,
      date: today,
    });

    if (!analytics) {
      analytics = new Analytics({
        userId,
        date: today,
      });
    }

    // Reset counts and recalculate
    analytics.totalLeads = await Lead.countDocuments({ assignedTo: userId });
    analytics.newLeads = await Lead.countDocuments({ assignedTo: userId, status: 'NEW' });
    analytics.contactedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'CONTACTED' });
    analytics.interestedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'INTERESTED' });
    analytics.closedLeads = await Lead.countDocuments({ assignedTo: userId, status: 'CLOSED' });
    analytics.lostLeads = await Lead.countDocuments({ assignedTo: userId, status: 'LOST' });
    analytics.totalMessages = await Message.countDocuments({ leadId: { $in: await Lead.find({ assignedTo: userId }).distinct('_id') } });
    analytics.totalConversions = analytics.closedLeads;
    analytics.totalRevenue = (await Lead.find({ assignedTo: userId, status: 'CLOSED' })).reduce((sum, lead) => sum + (lead.totalValue || 0), 0);

    await analytics.save();
  }

  async assignLead(leadId, userId) {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    lead.assignedTo = userId;
    lead.updatedAt = Date.now();
    
    if (lead.status === 'NEW') {
      lead.status = 'CONTACTED';
    }

    await lead.save();

    // Create status history
    await LeadStatusHistory.create({
      leadId: lead._id,
      fromStatus: lead.status === 'CONTACTED' ? 'NEW' : 'NONE',
      toStatus: lead.status,
      changedBy: userId,
      timestamp: new Date(),
    });

    return lead;
  }

  async setFollowUp(leadId, followUpDate, userId) {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    lead.followUpDate = followUpDate;
    lead.nextFollowUpReminder = followUpDate;
    lead.updatedAt = Date.now();
    
    await lead.save();

    return lead;
  }

  async getFollowUpLeads() {
    const now = new Date();
    
    return await Lead.find({
      followUpDate: { $lte: now },
      status: { $in: ['NEW', 'CONTACTED', 'INTERESTED'] },
    })
      .populate('assignedTo', 'firstName lastName email phoneNumber')
      .lean();
  }

  async searchLeads(userId, searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    
    return await Lead.find({
      assignedTo: userId,
      $or: [
        { name: regex },
        { phoneNumber: regex },
        { email: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getDashboardStats(userId) {
    const [totalLeads, newLeads, closedLeads, interestedLeads, totalMessages] = await Promise.all([
      Lead.countDocuments({ assignedTo: userId }),
      Lead.countDocuments({ assignedTo: userId, status: 'NEW' }),
      Lead.countDocuments({ assignedTo: userId, status: 'CLOSED' }),
      Lead.countDocuments({ assignedTo: userId, status: 'INTERESTED' }),
      Message.countDocuments({ leadId: { $in: await Lead.find({ assignedTo: userId }).distinct('_id') } }),
    ]);

    const closedLeadsData = await Lead.find({ 
      assignedTo: userId, 
      status: 'CLOSED' 
    }).select('totalValue currency');

    const totalRevenue = closedLeadsData.reduce((sum, lead) => sum + (lead.totalValue || 0), 0);

    return {
      totalLeads,
      newLeads,
      closedLeads,
      interestedLeads,
      totalMessages,
      totalRevenue,
    };
  }
}

module.exports = new LeadService();
