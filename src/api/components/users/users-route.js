// users-routes.js

const express = require('express');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');
const usersService = require('./users-service');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  route.post(
    '/',
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  route.put(
    '/:id',
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  route.delete('/:id', usersControllers.deleteUser);

  route.patch(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.updatePassword),
    usersControllers.updatePassword
  );
  route.patch(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.updatePassword),
    usersService.updatePassword
  );
};

