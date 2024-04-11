const { User } = require('../../../models');
const { comparePassword, hashPassword } = require('../../../utils/password');

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise}
 */
async function updatePassword(id, oldPassword, newPassword, confirmPassword) {
  // Retrieve the user from the database
  const user = await User.findById(id);

  // If user doesn't exist, return null
  if (!user) {
    return null;
  }

  // Validate old password
  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid old password');
    error.statusCode = 403;
    throw error;
  }

  // Validate new password
  if (newPassword.length < 6 || newPassword.length > 32) {
    const error = new Error('New password must be between 6 and 32 characters');
    error.statusCode = 403;
    throw error;
  }

  // Confirm new password
  if (newPassword !== confirmPassword) {
    const error = new Error('Password confirmation does not match');
    error.statusCode = 403;
    throw error;
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the user's password
  await User.updateOne({ _id: id }, { $set: { password: hashedPassword } });
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already taken');
    error.statusCode = 409;
    throw error;
  }

  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  // Check if email already exists excluding the current user
  const existingUser = await User.findOne({ email, _id: { $ne: id } });
  if (existingUser) {
    const error = new Error('Email already taken');
    error.statusCode = 409;
    throw error;
  }

  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};
