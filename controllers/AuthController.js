const User = require('../models/User');
const AuthService = require('../services/AuthService');
const TokenService = require('../services/TokenService');
const ValidationService = require('../services/ValidationService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.tokenService = new TokenService();
    this.validationService = new ValidationService();
  }

  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Validate input
      const validationError = await this.validationService.validateRegistration(req.body);
      if (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message,
          details: validationError.details
        });
      }

      // Check if user already exists
      const existingUser = await this.authService.findExistingUser(email, username);
      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return res.status(409).json({
          error: 'User already exists',
          message: `${field} is already registered`
        });
      }

      // Create new user
      const user = await this.authService.createUser({
        username,
        email,
        password,
        firstName,
        lastName
      });

      // Generate tokens
      const tokens = this.tokenService.generateTokens(user._id);

      // Save refresh token
      await this.authService.saveRefreshToken(user, tokens.refreshToken);

      // Set refresh token cookie
      this.tokenService.setRefreshTokenCookie(res, tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validationError = await this.validationService.validateLogin(req.body);
      if (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message,
          details: validationError.details
        });
      }

      // Find and validate user
      const user = await this.authService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await this.authService.verifyPassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Clean up expired tokens
      await this.authService.cleanupExpiredTokens(user);

      // Generate new tokens
      const tokens = this.tokenService.generateTokens(user._id);

      // Save refresh token and update last login
      await this.authService.updateUserLogin(user, tokens.refreshToken);

      // Set refresh token cookie
      this.tokenService.setRefreshTokenCookie(res, tokens.refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to login'
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'No refresh token provided'
        });
      }

      // Verify and process refresh token
      const result = await this.tokenService.refreshAccessToken(refreshToken);
      
      if (!result.success) {
        return res.status(401).json({
          error: 'Access denied',
          message: result.message
        });
      }

      // Set new refresh token cookie
      this.tokenService.setRefreshTokenCookie(res, result.newRefreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to refresh token'
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        await this.authService.removeRefreshToken(req.user._id, refreshToken);
      }

      // Clear refresh token cookie
      this.tokenService.clearRefreshTokenCookie(res);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout'
      });
    }
  }

  async logoutAll(req, res) {
    try {
      await this.authService.removeAllRefreshTokens(req.user._id);

      // Clear refresh token cookie
      this.tokenService.clearRefreshTokenCookie(res);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout from all devices'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get user profile'
      });
    }
  }
}

module.exports = AuthController;