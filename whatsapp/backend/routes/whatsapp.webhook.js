// const express = require('express');
// const router = express.Router();
// const WhatsAppService = require('../services/WhatsAppService');

// // @route   GET /webhook/whatsapp
// // @desc    WhatsApp webhook verification
// // @access  Public
// router.get('/', (req, res) => {
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];

//   if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
//     if (mode === 'subscribe') {
//       if (challenge) {
//         res.status(200).send(challenge);
//       } else {
//         res.status(400).send('CHALLENGE_NOT_PROVIDED');
//       }
//     } else {
//       res.status(400).send('MODE_NOT_SUPPORTED');
//     }
//   } else {
//     res.status(403).send('FORBIDDEN');
//   }
// });

// // @route   POST /webhook/whatsapp
// // @desc    Receive WhatsApp messages
// // @access  Public
// router.post('/', async (req, res) => {
//   try {
//     const { entry } = req.body;

//     if (!entry || !Array.isArray(entry)) {
//       return res.status(400).json({ success: false, message: 'Invalid webhook data' });
//     }

//     // Process each entry
//     for (const entryItem of entry) {
//       if (!entryItem.changes || !Array.isArray(entryItem.changes)) {
//         continue;
//       }

//       for (const change of entryItem.changes) {
//         if (change.value?.messages) {
//           // Process incoming messages
//           for (const message of change.value.messages) {
//             await processIncomingMessage(message, change.value.metadata);
//           }
//         }

//         if (change.value?.statuses) {
//           // Process message status updates
//           for (const status of change.value.statuses) {
//             await processMessageStatus(status);
//           }
//         }
//       }
//     }

//     res.status(200).json({ success: true, message: 'Webhook received' });
//   } catch (error) {
//     console.error('Webhook Error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// async function processIncomingMessage(message, metadata) {
//   const { from, id, timestamp, text, type } = message;
  
//   // Extract phone number (remove WhatsApp ID prefix if present)
//   const phoneNumber = from.replace('c:', '');
  
//   // Get business phone number
//   const businessPhoneNumber = metadata?.phone_number_id || 'unknown';
  
//   // Process text message
//   if (type === 'text' && text) {
//     const LeadService = require('../services/LeadService');
    
//     const result = await LeadService.createLeadFromMessage(
//       phoneNumber,
//       text.body,
//       null // We can get name from WhatsApp API if needed
//     );

//     console.log(`Processed message from ${phoneNumber}:`, result);

//     // Auto-reply if it's a new lead
//     if (result.isNewLead) {
//       const WhatsAppService = require('../services/WhatsAppService');
//       await WhatsAppService.sendMessage(
//         phoneNumber,
//         `Thank you for contacting us! We've received your message and a representative will get back to you shortly.`
//       );
//     }
//   }

//   // Handle other message types (image, video, location, etc.)
//   if (type === 'image' || type === 'video' || type === 'audio' || type === 'document' || type === 'location') {
//     console.log(`Received ${type} message from ${phoneNumber}`);
//   }
// }

// async function processMessageStatus(status) {
//   const { id, status: messageStatus, timestamp } = status;
  
//   console.log(`Message status update: ${id} -> ${messageStatus}`);
  
//   // Update message status in database if needed
//   // This can be used for tracking delivery and read receipts
// }

// module.exports = router;
const express = require('express');
const router = express.Router();
const WhatsAppService = require('../services/WhatsAppService');

// @route   GET /webhook/whatsapp
// @desc    WhatsApp webhook verification
// @access  Public
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    if (mode === 'subscribe') {
      if (challenge) {
        res.status(200).send(challenge);
      } else {
        res.status(400).send('CHALLENGE_NOT_PROVIDED');
      }
    } else {
      res.status(400).send('MODE_NOT_SUPPORTED');
    }
  } else {
    res.status(403).send('FORBIDDEN');
  }
});

// @route   POST /webhook/whatsapp
// @desc    Receive WhatsApp messages
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry || !Array.isArray(entry)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }

    // Process each entry
    for (const entryItem of entry) {
      if (!entryItem.changes || !Array.isArray(entryItem.changes)) {
        continue;
      }

      for (const change of entryItem.changes) {
        if (change.value?.messages) {
          // Handle the messages
          const messages = change.value.messages;
          // Process the messages here
          // ...
        }
      }
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;