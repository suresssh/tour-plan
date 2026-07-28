const app = require('./app');
const port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
