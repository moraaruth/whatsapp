const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const MessageController = require('../controllers/MessageController');
const { protect } = require('../middleware/auth');

// Leads routes
router.get('/', protect, LeadController.getAllLeads);
router.get('/dashboard/stats', protect, LeadController.getDashboardStats);
router.get('/search', protect, LeadController.searchLeads);
router.get('/:id', protect, LeadController.getLeadById);
router.patch('/:id/status', protect, LeadController.updateLeadStatus);
router.post('/:id/note', protect, LeadController.addNote);
router.post('/:id/assign', protect, LeadController.assignLead);
router.post('/:id/followup', protect, LeadController.setFollowUp);

// Messages routes
router.get('/:id/messages', protect, MessageController.getMessagesForLead);
router.post('/:id/messages', protect, MessageController.sendMessage);

module.exports = router;
