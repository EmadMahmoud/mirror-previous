const User = require('../models/user');
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'emmakarleson@gmail.com',
        pass: 'msgi kcdi hdhl kvqd'
    }
});


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error')
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: req.flash('error')
    });
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password!'); //saved in session
                return res.redirect('/login');
            };
            bcrypt.compare(password, user.password) //return true if recieved password matches real user.password
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => { //use only when you wanna make sure that session is saved before redirect
                            // console.log(err);
                            res.redirect('/');
                        });
                    };
                    req.flash('error', 'Invalid email or password!'); //saved in session
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(`Error comparing passwords: ${err}`);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(`Error finding user: ${err}`));

};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email already exists!'); //saved in session
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12) //returns a promise
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        profile: {
                            things: []
                        }
                    });
                    return user.save();
                })
                .then(result => {
                    transporter.sendMail({
                        to: email,
                        from: 'emmakarleson@gmail.com',
                        subject: 'Welcome To The Family',
                        html: '<h1>You successfully signed up!</h1>'
                    })
                        .catch(err => console.log(`Error sending mail: ${err}`));
                    res.redirect('/login');
                })
        })

        .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
}