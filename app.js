const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mirrorRoutes = require('./routes/mirror');
const authRoutes = require('./routes/auth');
const _404Controller = require('./controller/404');
const User = require('./models/user');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //pass session object to connect-mongodb function
const { csrfSync } = require('csrf-sync');

const flash = require('connect-flash');

const MONGODB_URI = 'mongodb+srv://emadis4char:J80zW1kxlvjrNefg@cluster0.dcyxwax.mongodb.net/mirror'

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
    //you can set an expire date for the session and mongo will delete it
})

const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => req.body['CSRFToken']
});


app.set("view engine", "ejs");
app.set("views", "views"); //it's the default

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({ secret: 'this string should be long in production', resave: false, saveUninitialized: false, store: store }))
//resave means to not resave the session on every request but only if something changed
//you can configure the cookie which is being saved by the session to maybe set the expire date.


app.use(csrfSynchronisedProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(`Error finding user: ${err}`));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


//routes
app.use(mirrorRoutes);
app.use(authRoutes);
app.get('/', (req, res, next) => {
    res.redirect('/profile');
})
app.use(_404Controller.get404);



mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
        console.log('Db Connected');
    })
    .catch(err => {
        console.log(`Error Connection to DB: ${err}`);
    });

