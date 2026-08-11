const fs = require('fs');
const ApiFeatures = require('../utils/apiFeatures');
//model
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res) => {
  const tourFeatures = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const tours = await tourFeatures.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    next(new AppError(`No tour found with id ${req.params.id}`, 404)); // pass the error to the global error handling middleware
    return;
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if(!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`, 404)); // pass the error to the global error handling middleware
  }

  res.status(200).json({
    status: 'updated',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour) {
    return next(new AppError(`No tour found with id ${req.params.id}`, 404));
  }
  res.status(204).json({
    status: 'Deleted',
  });
});

exports.getTopFive = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, duration, price, summary, description';
  next();
};

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty', // _id: {  '$difficulty'} // can use to change difficulty to uppercase or lowercase using $toUpper or $toLower
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'easy' } }, // to exclude easy difficulty from the stats, we can use this match stage after the group stage
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // match the startDates that are in the year specified in the request params
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        // group by month and count the number of tours starting in that month
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // add a new field called month with the value of _id
    },
    {
      $project: { _id: 0 }, // remove the _id field from the output
    },
    {
      $sort: { numTourStarts: 1 }, // sort by number of tour starts in ascending order
    },
    {
      $limit: 12, // limit to 12 results
    },
  ]);
  res.status(200).json({
    status: 'success',
    total: plan.length,
    data: {
      plan,
    },
  });
});
