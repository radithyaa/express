const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', (req, res) => authController.register(req, res));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res) => authController.login(req, res));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// @route   POST /api/auth/logout
// @desc    Logout user (single device)
// @access  Private
router.post('/logout', authMiddleware.authenticate(), (req, res) => authController.logout(req, res));

// @route   POST /api/auth/logout-all
// @desc    Logout user from all devices
// @access  Private
router.post('/logout-all', authMiddleware.authenticate(), (req, res) => authController.logoutAll(req, res));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware.authenticate(), (req, res) => authController.getCurrentUser(req, res));

module.exports = router;