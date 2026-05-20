const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, phoneNumber, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields',
        });
      }

      const result = await AuthService.register({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { emailOrPhone, password } = req.body;

      if (!emailOrPhone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email/phone and password',
        });
      }

      const result = await AuthService.login(emailOrPhone, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
