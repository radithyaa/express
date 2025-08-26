const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware.authenticate(), (req, res) => userController.getProfile(req, res));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware.authenticate(), (req, res) => userController.updateProfile(req, res));

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware.authenticate(), (req, res) => userController.changePassword(req, res));

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authMiddleware.authenticate(), (req, res) => userController.deactivateAccount(req, res));

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authMiddleware.authenticate(), authMiddleware.authorize('admin'), (req, res) => userController.getAllUsers(req, res));

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', authMiddleware.authenticate(), authMiddleware.authorize('admin'), (req, res) => userController.updateUserRole(req, res));

module.exports = router;