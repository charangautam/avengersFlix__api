const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models.js')

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
},(username, password, callback) => {
    console.log(`${username} ${password}`);
    Users.findOne({ Username: username })
        .then((user) => {
            if(!user) {
                console.log('incorect username');
                return callback(null, false, {message: 'Incorrect username or password'}); 
            }
            console.log('finished');
            return callback(null, user);
        })
        .catch((err) => {
            console.error(err);
            return callback(err);
        });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((err) => {
            console.error(err);
            return callback(err);
        });
}));
