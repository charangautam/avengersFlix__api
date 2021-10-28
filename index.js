const express = require('express');
const morgan = require('morgan');

const app = express();

let movies = [
    {
        name: 'Mad Max: Fury Road',
        released: '2015'
    },
    {
        name: 'Spider-Man: Into the Spider-Verse',
        released: '2018'
    },
    {
        name: 'Get Out',
        released: '2017'
    },
    {
        name: 'Black Panther',
        released: '2018'
    },  
    {
        name: 'Guardian of the Galaxy Vol. 2',
        released: '2017'
    },
    {
        name: 'Thor: Ragnarok',
        released: '2017'
    },  
    {
        name: 'Avengers: Infinity War',
        released: '2018'
    },
    {
        name: 'Avengers: End Game',
        released: '2019'
    }
]


// middleware
app.use(morgan('common'));
app.use(express.static('public'));

// routes
app.get('/', (req, res) => {
    res.send('Welcome to the homepage')
});

app.get('/movies', (req, res) => {
    res.send(movies)
});

app.get('/documentation.html', (req, res) => {
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

app.listen(8080, () => {
    console.log('server is running on port 8080')
});