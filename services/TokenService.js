const jwt = require('jsonwebtoken');
const AuthService = require('./AuthService');

class TokenService {
  constructor() {
    this.authService = new AuthService();
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      const validation = await this.authService.validateRefreshToken(decoded.userId, refreshToken);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const tokens = this.generateTokens(decoded.userId);
      
      await this.authService.updateRefreshToken(validation.user, refreshToken, tokens.refreshToken);

      return {
        success: true,
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return { success: false, message: 'Invalid refresh token' };
      }
      throw error;
    }
  }

  setRefreshTokenCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken');
  }
}

module.exports = TokenService;