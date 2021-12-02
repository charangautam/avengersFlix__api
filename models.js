const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Released: {
        type: String,
        required: true
    },
    Rating: {
        type: String,
        required: true
    },
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String,
        Age: String
    },
    ImgPath: String,
    Featured: Boolean
});

let userSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});


userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('Password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.Password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.Password = hash;
            next();
        });
    });

    // userSchema.statics.hashPassword = (password) => {
    //     return bcrypt.hashSync(password, 10);
    // };

    userSchema.methods.validatePassword = function (password) {
        return bcrypt.compareSync(password, this.Password);
    };

    let Movie = mongoose.model('Movie', movieSchema);
    let User = mongoose.model('User', userSchema);

    module.exports.Movie = Movie;
    module.exports.User = User;