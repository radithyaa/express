const User = require('../models/User');
const UserService = require('../services/UserService');
const ValidationService = require('../services/ValidationService');

class UserController {
  constructor() {
    this.userService = new UserService();
    this.validationService = new ValidationService();
  }

  async getProfile(req, res) {
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

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, username } = req.body;
      const userId = req.user._id;

      // Validate input
      const validationError = await this.validationService.validateProfileUpdate(req.body);
      if (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message,
          details: validationError.details
        });
      }

      // Check username availability
      if (username && username !== req.user.username) {
        const isUsernameAvailable = await this.userService.checkUsernameAvailability(username, userId);
        if (!isUsernameAvailable) {
          return res.status(409).json({
            error: 'Username already exists',
            message: 'This username is already taken'
          });
        }
      }

      // Update user profile
      const user = await this.userService.updateProfile(userId, {
        firstName,
        lastName,
        username
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update profile'
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      // Validate input
      const validationError = await this.validationService.validatePasswordChange(req.body);
      if (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message,
          details: validationError.details
        });
      }

      // Change password
      const result = await this.userService.changePassword(userId, currentPassword, newPassword);
      
      if (!result.success) {
        return res.status(result.statusCode).json({
          error: result.error,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to change password'
      });
    }
  }

  async deactivateAccount(req, res) {
    try {
      const userId = req.user._id;

      const result = await this.userService.deactivateAccount(userId);
      
      if (!result.success) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to deactivate account'
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const queryParams = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        role: req.query.role,
        isActive: req.query.isActive
      };

      const result = await this.userService.getAllUsers(queryParams);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get users'
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      if (!['user', 'admin', 'moderator'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: 'Role must be user, admin, or moderator'
        });
      }

      const user = await this.userService.updateUserRole(userId, role);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update user role'
      });
    }
  }
}

module.exports = UserController;