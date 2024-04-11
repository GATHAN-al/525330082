const usersRepository = require('./users-repository');
const { hashPassword, comparePassword } = require('../../../utils/password');


/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Check if email is already taken
 * @param {string} email - Email to check
 * @returns {boolean} - True if email is already taken, false otherwise
 */
async function isEmailTaken(email) {
  const existingUser = await usersRepository.getUserByEmail(email);
  return !!existingUser;
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Check if email already taken
  const emailTaken = await isEmailTaken(email);
  if (emailTaken) {
    const error = new Error('Email already taken');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  // Check if email already taken
  const emailTaken = await isEmailTaken(email);
  if (emailTaken) {
    const error = new Error('Email already taken');
    error.statusCode = 409;
    throw error;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {boolean}
 */
async function updatePassword(id, oldPassword, newPassword) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  // Validasi password lama
  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid old password');
    error.statusCode = 403;
    throw error;
  }

  // Validasi password baru
  if (newPassword.length < 6 || newPassword.length > 32) {
    const error = new Error('Invalid new password');
    error.statusCode = 403;
    throw error;
  }

  // Hash password baru
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  try {
    await usersRepository.updateUserPassword(id, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
};