const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message,err.stack);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

const DB = process.env.DB_URI.replace('<db_password>', process.env.DB_PASSWORD);

mongoose.connect(DB, {}).then((con) => {
  console.log('Db successfully connected');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});