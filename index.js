const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();

let movies = [
    {
        title: 'Mad Max: Fury Road',
        released: '2015',
        genre: 'action',
        director: {
            name: 'john',
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },
    {
        title: 'Spider-Man: Into the Spider-Verse',
        released: '2018',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },
    {
        title: 'Get Out',
        released: '2017',
        genre: 'horror',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },
    {
        title: 'Black Panther',
        released: '2018',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },  
    {
        title: 'Guardian of the Galaxy Vol. 2',
        released: '2017',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },
    {
        title: 'Thor: Ragnarok',
        released: '2017',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },  
    {
        title: 'Avengers: Infinity War',
        released: '2018',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    },
    {
        title: 'Avengers: End Game',
        released: '2019',
        genre: 'action',
        director: {
            bio: 'I make movies',
            birthYear: '1999',
            deathYear: 'n/a'
        }
    }
]


// middleware
app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());


// routes

// return
app.get('/', (req, res) => {
    res.send('Welcome to the homepage')
});

// Return all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies)
});

app.get('/movies/:title', (req, res) => {
    let movie = movies.find((movie) => {
        return movie.title === req.params.title;
    });
    if(movie) {
        res.status(200).json(movie)
    } else {
        res.status(400).send('No movie with that title is found')
    }
});

app.get('/movies/genre/:genre', (req, res) => {
    let movieList = []
    movies.find((movie) => {
        if(movie.genre === req.params.genre) {
            movieList.push(movie)
        }
    });

    res.json(movieList)
});

app.get('/movies/director/:directorName', (req, res) => {
    let director = movies.find((movie) => {
        return movie.director.name === req.params.directorName;
    });
    if(director) {
        res.status(200).json(director)
    } else {
        res.status(400).send('No director with that name is found')
    }
});

app.post('/users', (req, res) => {
    let user = req.body

    if(user.username) {
        res.status(200).json(user)
    } else {
        res.status(400).send('Valid user info was not passed in')
    }
});

app.put('/users/:username', (req, res) => {
    let username = req.params.username
    res.status(200).send(`Username has been changed to ${username}`)
});


let favorites = []
app.post('/users/add/:movieName', (req, res) => {
    let addMovie = movies.find((movie) => {
        return movie.title === req.params.movieName;
    });

    if(addMovie) {
        favorites.push(req.params.movieName)
        res.status(200).send(`${req.params.movieName} has been added to your favorites`);
    } else {
        res.status(400).send('Cannot find movie with that name');
    }
});

app.delete('/users/remove/:movieName', (req, res) => {
    favorites = favorites.filter((name) => { return name !== req.params.movieName });
    res.status(200).send(`${req.params.movieName} has been removed from your favorites`);
});

app.delete('/users/deleteAccount/:id', (req, res) => {
    res.status(200).send('Your account has been deleted');
})


app.get('/documentation.html', (req, res) => {
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

app.listen(8080, () => {
    console.log('server is running on port 8080')
});