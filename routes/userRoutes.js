const express = require('express');
const {
  getUserById,
  getUsersgetUsers,
  createUser,
  deleteUser,
  updateUser,
} = require('../controllers/userController');

const userRouter = express.Router();

userRouter.route('/').get(getUsersgetUsers).post(createUser);

userRouter.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
