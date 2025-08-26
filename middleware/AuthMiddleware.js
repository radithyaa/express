const TokenService = require('../services/TokenService');
const AuthService = require('../services/AuthService');

class AuthMiddleware {
  constructor() {
    this.tokenService = new TokenService();
    this.authService = new AuthService();
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null;

        if (!token) {
          return res.status(401).json({ 
            error: 'Access denied', 
            message: 'No token provided' 
          });
        }

        const decoded = this.tokenService.verifyAccessToken(token);
        
        const user = await this.authService.findUserById(decoded.userId);
        if (!user) {
          return res.status(401).json({ 
            error: 'Access denied', 
            message: 'Invalid token - user not found' 
          });
        }

        if (!user.isActive) {
          return res.status(401).json({ 
            error: 'Access denied', 
            message: 'Account is deactivated' 
          });
        }

        req.user = user;
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            error: 'Access denied', 
            message: 'Invalid token' 
          });
        }
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Access denied', 
            message: 'Token expired' 
          });
        }
        
        console.error('Authentication error:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: 'Authentication failed' 
        });
      }
    };
  }

  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'Authentication required' 
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      next();
    };
  }

  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null;

        if (token) {
          const decoded = this.tokenService.verifyAccessToken(token);
          const user = await this.authService.findUserById(decoded.userId);
          if (user && user.isActive) {
            req.user = user;
          }
        }
        
        next();
      } catch (error) {
        next();
      }
    };
  }
}

module.exports = AuthMiddleware;