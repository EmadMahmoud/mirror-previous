const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mirrorRoutes = require('./routes/mirror');
const _404Controller = require('./controller/404');
const User = require('./models/user');

const mongoose = require('mongoose');


app.set("view engine", "ejs");
app.set("views", "views"); //it's the default

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
    User.findById('6500c0cbfe52711b39ac4d66')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(`Error finding user: ${err}`));
});

app.use(mirrorRoutes);
app.get('/', (req, res, next) => {
    res.redirect('/profile');
})
app.use(_404Controller.get404);

mongoose.connect('mongodb+srv://emadis4char:J80zW1kxlvjrNefg@cluster0.dcyxwax.mongodb.net/mirror?retryWrites=true&w=majority')
    .then(result => {
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'omdany',
                        email: 'omdany@test.com',
                        profile: {
                            things: []
                        }
                    })
                    user.save();
                }
            })
        app.listen(3000);
        console.log('Db Connected');
    })
    .catch(err => {
        console.log(`Error Connection to DB: ${err}`);
    });

