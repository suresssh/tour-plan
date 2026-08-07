const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { tourRouter, userRouter } = require('./routes');

dotenv.config({ path: './.env' });

const app = express();

const DB = process.env.DB_URI.replace('<db_password>', process.env.DB_PASSWORD);

mongoose.connect(DB, {}).then((con) => {
  console.log('Db successfully connected');
});

// logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

//Middlewares
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from custom middleware');
  next();
});

// use multiple routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
