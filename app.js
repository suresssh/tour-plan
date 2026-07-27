const express = require('express');

const app = express();

const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from server side', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post on this endpoint');
});

app.get('/api/v1/tours', (req, res) => {

})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
