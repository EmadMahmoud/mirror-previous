const User = require('../models/user');
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const crypto = require('crypto');


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

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error')
    });
}

exports.postReset = (req, res, next) => {

    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => { //this cretes a 32 randombytes and return err if any or the buffer
        if (err) {
            console.log(err);
            req.flash('error', 'Error Occured, Please Try Again Later!');
            return res.redirect('/reset');
        };
        const token = buffer.toString('hex'); //converts the buffer to a string
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No Account With That Email Found!');
                    return res.redirect('/reset');
                };
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; //1 hour
                return user.save();
            })
            .then(result => {
                if (result) {
                    req.flash('error', 'Check Your Email To Reset Your Password')
                    res.redirect('/login')
                }
                transporter.sendMail({
                    to: email,
                    from: 'emmakarleson@gmail.com',
                    subject: 'Reset The Password',
                    html: `
                    <h1>You Requested a Password Reset</h1>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                    <hr>
                    <p>this email will not valid in 1 hour!<p>
                    `
                })
                    .catch(err => console.log(`Error sending Email: ${err}`));
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
                passwordToken: resetToken
            });

        })
        .catch(err => console.log(`Error finding user: ${err}`));

}

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const newPassword = req.body.password;
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
        .catch(err => console.log(`Error finding user: ${err}`));
}