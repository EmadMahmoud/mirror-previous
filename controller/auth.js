const User = require('../models/user');
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { SENDMAILPASS, SENDMAILUSER } = require('../util/config');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDMAILUSER,
        pass: SENDMAILPASS
    }
});


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: req.flash('error'), //removed from postSignup so it always be empty array
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    });
}

exports.postLogin = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg, // errors.array return an array of errors each error is an object
            oldInput: { email: email, password: password },
            validationErrors: errors.array()
        });
    }

    const user = await User.findOne({ email: email });
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

};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg, // errors.array return an array of errors each error is an object
            oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword },
            validationErrors: errors.array()
        });
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
                from: SENDMAILUSER,
                subject: 'Welcome To The Family',
                html: '<h1>You successfully signed up!</h1>'
            })
                .catch(err => console.log(`Error sending mail: ${err}`));
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error'),
        oldInput: { email: '' },
        validationErrors: []
    });
}

exports.postReset = (req, res, next) => {

    const email = req.body.email;
    const errros = validationResult(req);

    if (!errros.isEmpty()) {
        return res.status(422).render('auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            errorMessage: errros.array()[0].msg,
            oldInput: { email: email },
            validationErrors: errros.array()
        });
    }

    crypto.randomBytes(32, async (err, buffer) => { //this cretes a 32 randombytes and return err if any or the buffer
        if (err) {
            console.log(err);
            req.flash('error', 'Error Occured, Please Try Again Later!');
            return res.redirect('/reset');
        };
        const token = buffer.toString('hex'); //converts the buffer to a string
        const user = await User.findOne({ email: email })
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; //1 hour
        user.save()
            .then(result => {
                if (result) {
                    req.flash('error', 'Check Your Email To Reset Your Password')
                    res.redirect('/login')
                }
                transporter.sendMail({
                    to: email,
                    from: SENDMAILUSER,
                    subject: 'Reset The Password',
                    html: `
                <h1>You Requested a Password Reset</h1>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                <hr>
                <p>this email will not valid in 1 hour!<p>
                `
                })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    })
            })

    })

}

exports.getNewPassword = (req, res, next) => {
    const resetToken = req.params.token || null;
    if (!resetToken) {
        req.flash('error', 'No Token Found!');
        return res.redirect('/reset');
    }
    User.findOne({ resetToken: resetToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'No User Found!');
                return res.redirect('/reset');
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/new-password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: resetToken,
                oldInput: { password: '' },
                validationErrors: []
            });

        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const newPassword = req.body.password;
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: erros.array()[0].msg,
            userId: userId,
            passwordToken: passwordToken,
            oldInput: { password: newPassword },
            validationErrors: erros.array(),
        });
    }

    let resetUser;
    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            if (!user) {
                req.flash('error', 'No Token Found!');
                return res.redirect('/reset');
            }
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            if (result) {
                req.flash('error', 'Password Changed Successfully!');
                res.redirect('/login');
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}