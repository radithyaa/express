const { body, validationResult } = require('express-validator');

class ValidationService {
  async validateRegistration(data) {
    const rules = [
      body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
      
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      
      body('firstName')
        .isLength({ min: 1, max: 30 })
        .withMessage('First name must be between 1 and 30 characters')
        .trim(),
      
      body('lastName')
        .isLength({ min: 1, max: 30 })
        .withMessage('Last name must be between 1 and 30 characters')
        .trim()
    ];

    return this.runValidation(rules, data);
  }

  async validateLogin(data) {
    const rules = [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];

    return this.runValidation(rules, data);
  }

  async validatePasswordChange(data) {
    const rules = [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      
      body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    ];

    return this.runValidation(rules, data);
  }

  async validateProfileUpdate(data) {
    const rules = [
      body('firstName')
        .optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('First name must be between 1 and 30 characters')
        .trim(),
      
      body('lastName')
        .optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('Last name must be between 1 and 30 characters')
        .trim(),
      
      body('username')
        .optional()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
    ];

    return this.runValidation(rules, data);
  }

  async runValidation(rules, data) {
    // Create a mock request object for validation
    const req = { body: data };
    
    // Run validation rules
    for (const rule of rules) {
      await rule.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return {
        message: 'Please check your input data',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      };
    }

    return null;
  }
}

module.exports = ValidationService;