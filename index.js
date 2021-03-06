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

// connect to remote | local database
// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
let allowedOrigins = ['http://localhost:3000', 'https://avengersflix.netlify.app',
    'http://localhost:4200', 'https://charangautam.github.io', 'https://charangautam.github.io/avengersFlix-Angular'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());

// use routes
require('./auth')(app);
const passport = require('passport');
require('./passport');

// routes

/**
 * Create a new movie
 * @method POST
 * @param {string} endpoint - endpoint to create a new movie - "url/movies"
 * @returns {object} - returns the new created movie
 */
app.post('/movies', (req, res) => {
    Movies.create(req.body)
        .then(movie => {
            res.status(200).json(movie)
        })
        .catch(err => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        })
})

/**
 * Get all movies
 * @method GET
 * @param {string} endpoint - endpoint to fetch all the movies - "url/movies"
 * @returns {object} - returns all the movies
 * @requires authentication JWT
 */
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

/**
 * Get a movie by title
 * @method GET
 * @param {string} endpoint - endpoint to fetch a movie by title
 * @param {string} Title - is used to get a specific movie - "url/movies/:Title"
 * @returns {object} - returns the specific movie 
 * @requires authentication JWT
 */
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

/**
 * Get a genre by it's name
 * @method GET
 * @param {string} endpoint - endpoint to fetch a genre by it's name
 * @param {string} GenreName - is used to get a specific genre - "url/genres/:GenreName"
 * @returns {object} - returns the specific genre
 * @requires authentication JWT
 */
app.get('/genres/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.GenreName })
        .then((movie) => {
            res.status(200).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
 * Get a director by name
 * @method GET
 * @param {string} endpoint - endpoint to fetch a director by name
 * @param {string} DirectorName - is used to get a specific director - "url/directors/:DirectorName"
 * @returns {object} - returns the specific director
 * @requires authentication JWT
 */
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

/**
 * Create a new user
 * @method POST
 * @param {string} endpoint - endpoint to create a new user - "url/users"
 * @param {string} Username - username choosen by user
 * @param {string} Password - password choosen by user
 * @param {string} Email - email choosen by user
 * @param {string} Birthday - birthday choosen by user
 * @returns {object} - returns the new created user
 */
app.post('/users',
    [
        check('Username', 'Username is required and should be >= 4 characters').isLength({ min: 4 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required and should be >= 6 characters').isLength({ min: 6 }),
        check('Email', 'Email is required').isEmail()
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
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

/**
 * Get all users
 * @method GET
 * @param {string} endpoint - endpoint to fetch all users - "url/users"
 * @returns {object} - returns all the users
 * @requires authentication JWT
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
 * Get user by username
 * @method GET
 * @param {string} endpoint - endpoint to fetch user by username
 * @param {string} Username - is used to get a specific user - "url/users/:Username"
 * @returns {object} - returns the specific user
 * @requires authentication JWT
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
 * Update user by username
 * @method PUT
 * @param {string} endpoint - endpoint to update a user - "url/users/:Username"
 * @param {string} Username - user's new username or same if left empty
 * @param {string} Password - user's new password or same if left empty
 * @param {string} Email - user's new email or same if left empty
 * @param {string} Birthday - user's new birthday or same if left empty
 * @returns {object} - returns the new updated user
 * @requires authentication JWT
 */
app.put('/users/:Username',
    passport.authenticate('jwt', { session: false }),
    [
        check('Username', 'Username is required and should be >= 4 characters').isLength({ min: 4 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required and should be >= 6 characters').isLength({ min: 6 }),
        check('Email', 'Email is required').isEmail()
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        Users.findOne({ Username: req.params.Username })
            .then((user) => {
                if (user.Password !== req.body.Password) {
                    req.body.Password = Users.hashPassword(req.body.Password);
                }
                Users.findOneAndUpdate({ Username: req.params.Username },
                    { $set: req.body },
                    { new: true })
                    .then((user) => {
                        res.status(200).json(user);
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Error: ' + err);
                    });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }
);

/**
 * Add movie to favorites
 * @method POST
 * @param {string} endpoint - endpoint to add movies to favorites - "url/users/:Username/movies/MovieID"
 * @param {string} Username - is used to find a specific user
 * @param {string} MovieID - is used to add a movie's id to the user's favorites 
 * @returns {string} - returns success or error message
 */
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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

/**
 * Delete movie from favorites
 * @method DELETE
 * @param {string} endpoint - endpoint to remove movies from favorites - "url/users/:Username/movies/MovieID"
 * @param {string} Username - is used to find a specific user
 * @param {string} MovieID - is used to remove a movie's id from the user's favorites 
 * @returns {string} - returns success or error message
 */
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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

/**
 * Delete user by username
 * @method DELETE
 * @param {string} endpoint - endpoint to delete a user
 * @param {string} Username - is used to delete a specific user - "url/users/:Username"
 * @returns {string} success or error message
 * @requires authentication JWT
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(404).send(`${req.params.Username} was not found`);
            } else {
                res.status(204).end();
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

