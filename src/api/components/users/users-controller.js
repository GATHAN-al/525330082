const { User } = require('../../../models');
const { errorResponder, errorTypes } = require('../../../core/errors');



async function getUsers(request, response, next) {
  try {
    const users = await User.find({});
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

async function getUser(request, response, next) {
  try {
    const user = await User.findById(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function createUser(request, response, next) {
  try {
    const { email, password, password_confirm } = request.body;

    // Validasi password
    if (password !== password_confirm) {
      return response.status(403).json({
        statusCode: 403,
        error: 'INVALID_PASSWORD_ERROR',
        description: 'Invalid password',
        message: 'Password does not match'
      });
    }

    // Lanjutkan proses pembuatan pengguna
    // Misalnya:
    // const newUser = await User.create({ email, password });

    return response.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    return next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    const emailExists = await User.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email already taken'
      );
    }

    const user = await User.findById(id);
    if (!user) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown user'
      );
    }

    await User.updateOne(
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

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const user = await User.findById(id);
    if (!user) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown user'
      );
    }

    await User.deleteOne({ _id: id });

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
async function updatePassword(request, response, next) {
  try {
    const userId = request.params.id;
    const { oldPassword, newPassword, confirmPassword } = request.body;

    // Mencari pengguna berdasarkan ID
    const user = await User.findById(userId);
    if (!user) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown user'
      );
    }

    // Validasi password lama
    if (oldPassword !== user.password) {
      return response.status(403).json({
        statusCode: 403,
        error: 'INVALID_PASSWORD_ERROR',
        description: 'Invalid password',
        message: 'Old password is incorrect'
      });
    }

    // Validasi password baru
    if (newPassword.length < 6 || newPassword.length > 32) {
      return response.status(403).json({
        statusCode: 403,
        error: 'INVALID_PASSWORD_ERROR',
        description: 'Invalid password',
        message: 'New password must be between 6 and 32 characters'
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(403).json({
        statusCode: 403,
        error: 'INVALID_PASSWORD_ERROR',
        description: 'Invalid password',
        message: 'Password confirmation does not match'
      });
    }

    // Mengubah password pengguna
    user.password = newPassword;
    await user.save();

    return response.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}



module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  
};