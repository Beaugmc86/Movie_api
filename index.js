const express = require('express');
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  const morgan = require('morgan');

// Set up to use bodyParser
app.use(bodyParser.json());

// setup the logger
app.use(morgan('common'));

let users = [
  {
    "id": 1,
    "name": "Beau",
    "favoriteMovies": ['The Thing']
  },
  {
    "id": 2,
    "name": 'Kayla',
    "favoriteMovies": []
  },
]

let movies = [
  {
    'Title': 'Total Recall',
    'Director': {
      'Name': 'Paul Verhoeven'
    },
    'Genre': {
      'Name': 'Action'
    }
  },
  {
    'Title': 'The Thing',
    'Director': {
      'Name': 'John Carpenter'
    },
    'Genre': {
      'Name': 'Horror'
    }
  },
  {
    'Title': 'Dawn of the Dead',
    "Director": {
      'Name': 'George A. Romero',
    },
    "Genre": {
      'Name': 'Horror'
    }
  },
  {
    'Title': 'Batman',
    "Director": {
      'Name': 'Tim Burton',
    },
    "Genre": {
      'Name': 'Action'
    }
  },

];

// CREATE (add new user)
app.post ('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('Users need names')
  }
});

// UPDATE (update user info using name)
app.put ('/users/:id', (req, res) => {
  const { id } = req.params
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user.')
  }
});

// CREATE (update with favorite movie)
app.post ('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('No such movieTitle.')
  }
});

// DELETE (remove movie from user favorite list)
app.delete ('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('No such movieTitle.')
  }
});

// DELETE (deregister user)
app.delete ('/users/:id', (req, res) => {
  const { id } = req.params

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`user ${id} has been deleted.`);
  } else {
    res.status(400).send('No such users.')
  }
});

// Get requests (READ)
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// READ (return list of movies to user)
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ (return movie title to user)
app.get('/movies/:title', (req, res) => {
//   res.send('Successful GET request for movie title request')
// });

  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie')
  }
});

// READ (return movie genre to user)
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre')
  }
});

// READ (return director information to user)
app.get('/movies/:directors/:directorName', (req, res) => {
  const { directorName } = req.params
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director')
  }
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