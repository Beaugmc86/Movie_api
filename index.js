const express = require('express');
  const morgan = require('morgan');

const app = express();

// setup the logger
app.use(morgan('common'));

let topMovies = [
  {
    title: 'Halloween',
    director: 'John Carpenter'
  },
  {
    title: 'Total Recall',
    director: 'Paul Verhoeven'
  },
  {
    title: 'A Nightmare on Elm Street',
    director: 'Wes Craven'
  },
  {
    title: 'The Thing',
    director: 'John Carpenter'
  },
  {
    title: 'Return of the Living Dead',
    director: 'Dan O\'Bannon'
  },
  {
    title: 'Dawn of the Dead',
    director: 'George A. Romero'
  },
  {
    title: 'Alien',
    director: 'Ridley Scott'
  },
  {
    title: 'Batman Returns',
    director: 'Tim Burton'
  },
  {
    title: 'Terminator 2: Judgment Day',
    director: 'James Cameron'
  },
  {
    title: 'Evil Dead II',
    director: 'Sam Raimi'
  },
];

// Get requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

// Use express.static file
app.use('/myDocumentation', express.static('public', {index: 'documentation.html'}));

// Error handling midleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});