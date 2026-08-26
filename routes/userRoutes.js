const express = require('express');
const {
  getUserById,
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.signUp);

userRouter.route('/login').post(authController.login);

userRouter.route('/forgotpassword').post(authController.forgotPassword);
userRouter.route('/resetpassword/:token').patch(authController.resetPassword);
userRouter
  .route('/updatepassword')
  .patch(authController.protect, authController.updatePassword);

userRouter.route('/updateMe').patch(authController.protect, updateMe);
userRouter.route('/deleteMe').delete(authController.protect, deleteMe);


userRouter
  .route('/')
  .get(authController.protect, authController.restrictTo(['admin']), getUsers)
  .post(authController.protect, authController.restrictTo(['admin']), createUser);

userRouter
  .route('/:id')
  .get(getUserById)
  .patch(
    authController.protect,
    authController.restrictTo(['admin']),
    updateUser,
  )
  .delete(
    authController.protect,
    authController.restrictTo(['admin']),
    deleteUser,
  );

module.exports = userRouter;
