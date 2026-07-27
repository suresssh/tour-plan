const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

const port = 3000;

//Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log('Hello from custom middleware');
  next();
});

// fs
const toursFile = `${__dirname}/dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursFile));

// Common helper function to write tours data to file
const writeToursFile = (data, callback) => {
  fs.writeFile(toursFile, JSON.stringify(data), callback);
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTourById = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex((el) => el.id === id);

  if (tourIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

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

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex((el) => el.id === id);

  if (tourIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

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

/**Routes */

// also use app.get('/api/v1/tours',getAllTours);  app.post('/api/v1/tours', createTour);
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTour);

/**Server init */
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
