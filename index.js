const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// routes
const authRoutes = require('./auth.js');

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
  }
}));
app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());

// use routes
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// routes

// return home pg
app.get('/', (req, res) => {
    res.send('Welcome to the homepage')
});

// get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        })
});

// get one movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// return description of genre
app.get('/genres/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.GenreName })
        .then((movie) => {
            res.status(200).json(movie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// return director info 
app.get('/directors/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.DirectorName })
        .then((movie) => {
            res.status(200).json(movie.Director)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// create a user
app.post('/users', 
    [
        check('Username', 'Username is required and should be >= 4 characters').isLength({ min: 4 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required and should be >= 6 characters').isLength({ min: 6 }),
        check('Email', 'Email is required').isEmail()
    ],
    (req, res) => {
        let errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(`The username '${req.body.Username}' already exists`);
                } else {
                    req.body.Password = Users.hashPassword(req.body.Password);
                    Users.create(req.body)
                        .then((user) => res.status(201).json(user))
                        .catch((err) => {
                            console.error(err);
                            res.status(500).send(`Error: ${err}`)
                        });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`)
            });
    }
);

// get all users 
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// get a user 
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

// update user info 
app.put('/users/:Username', 
    passport.authenticate('jwt', { session: false }),
    [
        check('Username', 'Username is required and should be >= 4 characters').isLength({ min: 4 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required and should be >= 6 characters').isLength({ min: 6 }),
        check('Email', 'Email is required').isEmail()
    ],
    (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, 
            { $set: req.body}, 
            { new: true })
            .then((user) => {
                res.status(200).json(user);
                })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// add movie to a user's favorite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        { $addToSet: { FavoriteMovies: req.params.MovieID } },
        { new: true })
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// delete movie to a user's favorite movies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true })
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// delete a user 
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if(!user) {
                res.status(400).send(`${req.params.Username} was not found`);
            } else {
                res.status(200).send(`${req.params.Username} was deleted`)
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// backend documentation
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/documentation.html'));
});

// catch all error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

// server
const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
    console.log(`server is running on ${port}`);
});

