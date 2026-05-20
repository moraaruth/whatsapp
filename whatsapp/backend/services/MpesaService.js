const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/config');

class MpesaService {
  constructor() {
    this.consumerKey = config.mpesa.consumerKey;
    this.consumerSecret = config.mpesa.consumerSecret;
    this.shortcode = config.mpesa.shortcode;
    this.passkey = config.mpesa.passkey;
    this.env = config.mpesa.env;
    this.callbackUrl = config.mpesa.callbackUrl;
    this.stkPushTimeout = config.mpesa.stkPushTimeout;
    
    this.baseUrl = this.env === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';
    
    this._token = null;
    this._tokenExpiry = null;
  }

  async _getAccessToken() {
    if (this._token && this._tokenExpiry && Date.now() < this._tokenExpiry) {
      return this._token;
    }

    try {
      const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
          },
          timeout: 10000,
        }
      );

      this._token = response.data.access_token;
      this._tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      return this._token;
    } catch (error) {
      console.error('M-Pesa Token Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generatePassword() {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace(/\.\d+Z$/, '');
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('base64');
  }

  async stkPush(phoneNumber, amount, accountReference = 'WhatsAppLeadTracker', transactionType = 'CustomerBuyGoodsOnline') {
    try {
      const accessToken = await this._getAccessToken();
      const password = await this.generatePassword();
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace(/\.\d+Z$/, '');

      const endpoint = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'WhatsApp Lead Tracker Subscription Payment',
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: this.stkPushTimeout,
      });

      return response.data;
    } catch (error) {
      console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async validateMpesaPayment(result) {
    const { ResultCode, ResultDesc, MerchantRequestID, CheckoutRequestID, Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber } = result;

    if (ResultCode === 0) {
      // Payment successful
      return {
        success: true,
        transactionId: MpesaReceiptNumber,
        amount: Amount,
        phoneNumber: PhoneNumber,
        transactionDate: TransactionDate,
        status: 'COMPLETED',
      };
    } else {
      // Payment failed or cancelled
      return {
        success: false,
        errorCode: ResultCode,
        errorMessage: ResultDesc,
        status: 'FAILED',
      };
    }
  }

  async checkTransactionStatus(checkoutRequestID) {
    try {
      const accessToken = await this._getAccessToken();
      const password = await this.generatePassword();
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').replace(/\.\d+Z$/, '');

      const endpoint = `${this.baseUrl}/mpesa/transactionstatus/v1/query`;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('M-Pesa Transaction Status Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MpesaService();
