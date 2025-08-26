const express = require('express');
const ProtectedController = require('../controllers/ProtectedController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();
const protectedController = new ProtectedController();
const authMiddleware = new AuthMiddleware();

// @route   GET /api/protected/user
// @desc    Protected route for authenticated users
// @access  Private
router.get('/user', authMiddleware.authenticate(), (req, res) => protectedController.userProtectedRoute(req, res));

// @route   GET /api/protected/admin
// @desc    Protected route for admin users only
// @access  Private/Admin
router.get('/admin', authMiddleware.authenticate(), authMiddleware.authorize('admin'), (req, res) => protectedController.adminProtectedRoute(req, res));

// @route   GET /api/protected/moderator
// @desc    Protected route for moderators and admins
// @access  Private/Moderator
router.get('/moderator', authMiddleware.authenticate(), authMiddleware.authorize('moderator', 'admin'), (req, res) => protectedController.moderatorProtectedRoute(req, res));

// @route   GET /api/protected/optional
// @desc    Route with optional authentication
// @access  Public/Optional Auth
router.get('/optional', authMiddleware.optionalAuth(), (req, res) => protectedController.optionalAuthRoute(req, res));

module.exports = router;