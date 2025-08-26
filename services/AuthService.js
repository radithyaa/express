const User = require('../models/User');

class AuthService {
  async findExistingUser(email, username) {
    return await User.findOne({
      $or: [{ email }, { username }]
    });
  }

  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  async findUserById(userId) {
    return await User.findById(userId).select('-password -refreshTokens');
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async verifyPassword(user, password) {
    return await user.comparePassword(password);
  }

  async saveRefreshToken(user, refreshToken) {
    user.refreshTokens.push({ token: refreshToken });
    await user.save();
  }

  async updateUserLogin(user, refreshToken) {
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();
  }

  async cleanupExpiredTokens(user) {
    user.removeExpiredTokens();
    await user.save();
  }

  async removeRefreshToken(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
      await user.save();
    }
  }

  async removeAllRefreshTokens(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
  }

  async validateRefreshToken(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user || !user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)) {
      return { valid: false, message: 'Invalid refresh token' };
    }

    if (!user.isActive) {
      return { valid: false, message: 'Account is deactivated' };
    }

    return { valid: true, user };
  }

  async updateRefreshToken(user, oldToken, newToken) {
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== oldToken);
    user.refreshTokens.push({ token: newToken });
    await user.save();
  }
}

module.exports = AuthService;