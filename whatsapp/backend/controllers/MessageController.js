const LeadService = require('../services/LeadService');

class MessageController {
  async getMessagesForLead(req, res) {
    try {
      const { id } = req.params;
      const messages = await LeadService.getMessagesForLead(id);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { id } = req.params;
      const { messageText, mediaUrl, mediaType } = req.body;

      if (!messageText && !mediaUrl) {
        return res.status(400).json({
          success: false,
          message: 'Please provide message text or media URL',
        });
      }

      const lead = await LeadService.getLeadById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      // Send WhatsApp message
      const whatsappResponse = await WhatsAppService.sendMessage(
        lead.phoneNumber,
        messageText,
        mediaUrl,
        mediaType
      );

      // Save message to database
      const message = new Message({
        leadId: id,
        sender: 'business',
        phoneNumber: lead.phoneNumber,
        messageText,
        whatsappMessageId: whatsappResponse.messages?.[0]?.id,
        timestamp: new Date(),
        status: 'SENT',
      });

      await message.save();

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MessageController();
