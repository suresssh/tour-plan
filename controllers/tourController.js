const fs = require('fs');
const ApiFeatures = require('../utils/apiFeatures');
//model
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Not Found',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not save tour data',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'updated',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Update Failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id, {});
    res.status(204).json({
      status: 'Deleted',
    });
  } catch (error) {
    res.status(404).json({
      status: 'success',
      message: error,
    });
  }
};

exports.getTopFive = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, duration, price, summary, description';
  next();
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: { // match the startDates that are in the year specified in the request params
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: { // group by month and count the number of tours starting in that month
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
      }
    ]);
    res.status(200).json({
      status: 'success',
      total: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
