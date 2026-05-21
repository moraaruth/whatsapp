// const LeadService = require('../services/LeadService');

// class MessageController {
//   async getMessagesForLead(req, res) {
//     try {
//       const { id } = req.params;
//       const messages = await LeadService.getMessagesForLead(id);

//       res.status(200).json({
//         success: true,
//         data: messages,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   async sendMessage(req, res) {
//     try {
//       const { id } = req.params;
//       const { messageText, mediaUrl, mediaType } = req.body;

//       if (!messageText && !mediaUrl) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide message text or media URL',
//         });
//       }

//       const lead = await LeadService.getLeadById(id);

//       if (!lead) {
//         return res.status(404).json({
//           success: false,
//           message: 'Lead not found',
//         });
//       }

//       // Send WhatsApp message
//       const whatsappResponse = await WhatsAppService.sendMessage(
//         lead.phoneNumber,
//         messageText,
//         mediaUrl,
//         mediaType
//       );

//       // Save message to database
//       const message = new Message({
//         leadId: id,
//         sender: 'business',
//         phoneNumber: lead.phoneNumber,
//         messageText,
//         whatsappMessageId: whatsappResponse.messages?.[0]?.id,
//         timestamp: new Date(),
//         status: 'SENT',
//       });

//       await message.save();

//       res.status(200).json({
//         success: true,
//         message: 'Message sent successfully',
//         data: message,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// }

// module.exports = new MessageController();
// controllers/MessageController.js
const LeadService = require('../services/LeadService');
const WhatsAppService = require('../services/WhatsAppService'); // Added missing import
const Message = require('../models/Message'); // Adjust this path to match your exact Message model path

class MessageController {
  
  /**
   * AUTOMATION: Handles the incoming Webhook from Meta.
   * This listens for messages from customers and sends back an automated response instantly.
   */
  async handleIncomingWebhook(req, res) {
    const body = req.body;

    // 1. Always acknowledge receipt immediately to Meta to prevent retry loops
    res.sendStatus(200);

    try {
      // 2. Extract and check if the payload contains a valid message entry
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const incomingMessage = body.entry[0].changes[0].value.messages[0];
        const customerPhone = incomingMessage.from; // Automatically gets customer phone (e.g., '254707438317')
        const receivedText = incomingMessage.text?.body || '';

        console.log(`🤖 Automated pipeline triggered for customer: ${customerPhone}`);

        // 3. Optional: Look up or create/update the Lead record using your LeadService
        // const lead = await LeadService.getOrCreateLeadByPhone(customerPhone);

        // 4. Set up template parameters matching your Meta curl request blueprint
        const templateComponents = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'Valued Customer' },                    // Param 1: {{1}}
              { type: 'text', text: String(Date.now()).slice(-6) },              // Param 2: {{2}} (Dynamic code generation)
              { type: 'text', text: new Date().toLocaleDateString('en-US') } // Param 3: {{3}}
            ]
          }
        ];

        // 5. Fire off the automated response loop on total autopilot
        const whatsappResponse = await WhatsAppService.sendTemplateMessage(
          customerPhone,
          'jaspers_market_order_confirmation_v1', // Your verified template name
          'en_US',
          templateComponents
        );

        // 6. Log the outbound automated response to your internal tracking database
        const automatedLog = new Message({
          leadId: null, // Link to your lead ID variable here if you looked it up above
          sender: 'business',
          phoneNumber: customerPhone,
          messageText: `Automated Template: jaspers_market_order_confirmation_v1`,
          whatsappMessageId: whatsappResponse.messages?.[0]?.id,
          timestamp: new Date(),
          status: 'SENT',
        });

        await automatedLog.save();
        console.log(`🚀 Automated response successfully delivered to ${customerPhone}`);
      }
    } catch (error) {
      console.error('❌ Automation Gateway processing failure:', error.response?.data || error.message);
    }
  }

  /**
   * Existing logic: Fetch messages history for frontend view rendering
   */
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

  /**
   * Existing logic: Handle manual dashboard replies typed out from UI layout
   */
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