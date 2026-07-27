const fs = require('fs');

// fs
const toursFile = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursFile));

// Common helper function to write tours data to file
const writeToursFile = (data, callback) => {
  fs.writeFile(toursFile, JSON.stringify(data), callback);
};

exports.checkCreateReq = (req, res, next) => {
  console.log(req)
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }

  next();
};

exports.checkID = (req, res, next, val) => {
  const tour = tours.find((el) => el.id === val * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTourById = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours.length > 0 ? tours[tours.length - 1].id + 1 : 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  writeToursFile(tours, (err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not save tour data',
      });
    }
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex((el) => el.id === id);

  Object.assign(tours[tourIndex], req.body);

  writeToursFile(tours, (err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not update tour data',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour: tours[tourIndex],
      },
    });
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex((el) => el.id === id);

  tours.splice(tourIndex, 1);

  writeToursFile(tours, (err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not delete tour data',
      });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};
