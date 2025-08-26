class ProtectedController {
  async userProtectedRoute(req, res) {
    res.json({
      success: true,
      message: 'This is a protected route for authenticated users',
      data: {
        user: req.user,
        timestamp: new Date().toISOString()
      }
    });
  }

  async adminProtectedRoute(req, res) {
    res.json({
      success: true,
      message: 'This is a protected route for admin users only',
      data: {
        user: req.user,
        timestamp: new Date().toISOString()
      }
    });
  }

  async moderatorProtectedRoute(req, res) {
    res.json({
      success: true,
      message: 'This is a protected route for moderators and admins',
      data: {
        user: req.user,
        timestamp: new Date().toISOString()
      }
    });
  }

  async optionalAuthRoute(req, res) {
    const message = req.user 
      ? `Hello ${req.user.firstName}, you are authenticated!`
      : 'Hello guest, you can access this route without authentication';

    res.json({
      success: true,
      message,
      data: {
        user: req.user || null,
        isAuthenticated: !!req.user,
        timestamp: new Date().toISOString()
      }
    });
  }
}

module.exports = ProtectedController;