const User = require('../models/User');

class UserService {
  async checkUsernameAvailability(username, excludeUserId) {
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: excludeUserId } 
    });
    return !existingUser;
  }

  async updateProfile(userId, updateData) {
    const filteredData = {};
    if (updateData.firstName) filteredData.firstName = updateData.firstName;
    if (updateData.lastName) filteredData.lastName = updateData.lastName;
    if (updateData.username) filteredData.username = updateData.username;

    return await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        statusCode: 404,
        error: 'User not found',
        message: 'User account not found'
      };
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        statusCode: 400,
        error: 'Invalid password',
        message: 'Current password is incorrect'
      };
    }

    user.password = newPassword;
    await user.save();

    return { success: true };
  }

  async deactivateAccount(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        refreshTokens: []
      },
      { new: true }
    ).select('-password -refreshTokens');

    return { success: !!user, user };
  }

  async getAllUsers(queryParams) {
    const { page, limit, search, role, isActive } = queryParams;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count
    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserRole(userId, role) {
    return await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
  }

  async findById(userId) {
    return await User.findById(userId).select('-password -refreshTokens');
  }
}

module.exports = UserService;