const express = require('express');
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkCreateReq,
} = require('../controllers/tourController');

const tourRouter = express.Router();

tourRouter.param('id', checkID);

tourRouter.route('/').get(getAllTours).post(checkCreateReq, createTour);

tourRouter.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
