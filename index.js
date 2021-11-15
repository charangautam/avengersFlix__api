const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// routes
const authRoutes = require('./auth.js');

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());

// use routes
app.use('/', authRoutes)
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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(`The username '${req.body.Username}' already exists`);
            } else {
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
});

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

// update user info 
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
});

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
app.listen(8080, () => {
    console.log('server is running on port 8080')
});