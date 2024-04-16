const express = require('express');
const bodyParser = require('body-parser');
  uuid = require('uuid');
const { check, validationResult } = require('express-validator');

const morgan = require('morgan');
const app = express();

// Set up to use bodyParser
app.use(bodyParser.json());

// Set up to use express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import auth.js
let auth = require('./auth')(app);

//Import CORS
const cors = require('cors');

let allowedOrigins = ['http://localhost:1234'];

app.use(cors({
  

}));

// Import passport.js
const passport = require('passport');
require('./passport');

// setup the logger
app.use(morgan('common'));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { 
mongoose.connect( process.env.CONNECTION_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// READ (Get request)
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// CREATE (Add new user)
app.post('/users', [
  //input validation
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').notEmpty(),
  check('email', 'Email does not appear to be valid.').isEmail()
  ],
  async (req, res) => {
  // check validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.password);
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthdate: req.body.birthdate
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
app.get('/users', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.find()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//READ (Get user by username)
app.get('/users/:username', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOne({ username: req.params.username })
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).send('User not found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ (Get list of movies)
app.get('/movies', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error' + err);
  });
});

// READ (Get movie by title)
app.get('/movies/:Title', passport.authenticate('jwt', {session: false }), async (req, res) => {
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
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false }), async (req, res) => {
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
app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false }), async (req, res) => {
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
app.put('/users/:username', [
  //input validation
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').notEmpty(),
  check('email', 'Email does not appear to be valid.').isEmail()
  ],
  passport.authenticate('jwt', {session: false }), async (req, res) => {
  // Check validation object for errors
  let errors = validationResult(req);

  // CONDITION TO CHECK USER
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
  }

  let hashedPassword = Users.hashPassword(req.body.password);
  await Users.findOneAndUpdate({ username: req.params.username },
    {$set: {
      username: req.body.username,
      password: hashedPassword || req.body.password,
      email: req.body.email,
      birthdate: req.body.birthdate
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
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username },
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
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username },
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
app.delete('/users/:username', passport.authenticate('jwt', {session: false }), async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});