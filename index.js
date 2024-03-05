const express = require('express');
const bodyParser = require('body-parser');
  uuid = require('uuid');

const morgan = require('morgan');
const app = express();

// Set up to use bodyParser
app.use(bodyParser.json());

// Set up to use express
app.use(express.urlencoded({ extended: true }));

// setup the logger
app.use(morgan('common'));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
});

// READ (Get request)
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// CREATE (Add new user)
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthdate
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//READ (Get list of users)
// app.get('/users', async (req, res) => {
//   await Users.find()
//     .then((user) => {
//       res.json(user);
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Error: ' + error);
//     });
// });

//READ (Get user by username)
// app.get('/users/:Username', async (req, res) => {
//   await Users.findOne({ Username: req.params.Username })
//     .then((user) => {
//       if (user) {
//         res.json(user);
//       } else {
//         res.status(404).send('User not found');
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// READ (Get list of movies)
app.get('/movies', async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error' + err);
  });
});

// READ (Get movie by title)
app.get('/movies/:Title', async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ (Get movie list by genre)
app.get('/movies/genre/:genreName', async (req, res) => {
  await Movies.find({ "Genre.Name": req.params.genreName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ (Get movie list by director)
app.get('/movies/director/:directorName', async (req, res) => {
  await Movies.find({ "Director.Name": req.params.directorName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// UPDATE (Update a user's info, by username)
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthdate
      }
    },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

// UPDATE (Add a movie to a user's list of favorites)
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// DELETE (Remove a movie from a user's list of favorites)
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {$pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// DELETE (Delete a user by username)
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Use express.static file
app.use('/myDocumentation', express.static('public', {index: 'documentation.html'}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});