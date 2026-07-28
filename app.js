const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const { tourRouter, userRouter } = require('./routes');

const app = express();

app.use(express.static(`${__dirname}/public`));

//Middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log('Hello from custom middleware');
  next();
});

// use multiple routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
