const axios = require('axios');
const config = require('../config/config');

class WhatsAppService {
  constructor() {
    this.apiUrl = config.whatsapp.apiUrl;
    this.accessToken = config.whatsapp.accessToken;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
  }

  async verifyWebhook(mode, challenge) {
    if (mode === 'subscribe' && challenge) {
      return challenge;
    }
    return null;
  }

  async sendMessage(to, messageText, mediaUrl = null, mediaType = null) {
    try {
      const endpoint = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: mediaUrl ? 'interactive' : 'text',
        ...(mediaUrl 
          ? this._buildMediaMessage(mediaType, mediaUrl, messageText)
          : { text: { body: messageText } }
        ),
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  _buildMediaMessage(mediaType, mediaUrl, caption) {
    switch (mediaType?.toUpperCase()) {
      case 'IMAGE':
        return {
          type: 'image',
          image: { link: mediaUrl, caption },
        };
      case 'VIDEO':
        return {
          type: 'video',
          video: { link: mediaUrl, caption },
        };
      case 'AUDIO':
        return {
          type: 'audio',
          audio: { link: mediaUrl },
        };
      case 'DOCUMENT':
        return {
          type: 'document',
          document: { link: mediaUrl, caption },
        };
      default:
        return { text: { body: caption } };
    }
  }

  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    try {
      const endpoint = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('WhatsApp Template Message Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const endpoint = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        message_id: messageId,
        status: 'read',
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPhoneNumberDetails() {
    try {
      const endpoint = `${this.apiUrl}/${this.phoneNumberId}`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting phone number details:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
