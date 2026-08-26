const express = require('express');
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getTopFive,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const authController = require('../controllers/authController');
const tourRouter = express.Router();

// tourRouter.param('id', checkID); //no longer required

tourRouter.route('/top-5-cheap').get(getTopFive, getAllTours);

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/').get(authController.protect, getAllTours).post(createTour);

tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide']),
    deleteTour,
  );

module.exports = tourRouter;
