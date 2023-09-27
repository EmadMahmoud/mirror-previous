const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs')

router.get('/login', authController.getLogin);
router.post('/login',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail').custom(async value => {
            const user = await User.findOne({ email: value });
            if (!user) {
                throw new Error('No user with that email');
            }
        }),
        body('password', 'Incorrect Password').isAlphanumeric().custom(async (value, { req }) => {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                const doMatch = await bcrypt.compare(value, user.password);
                if (!doMatch) {
                    throw new Error('Incorrect Password');
                }
            }
            return true;
        })
    ],
    authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail').normalizeEmail().custom(async value => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('e-mail already in use, please choose another one');
            }
        }),
        body('password', 'The Password need to be between 5-30 character length and alphanumeric').isLength({ min: 5, max: 30 }).isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
    ],
    authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset',
    [
        body('email').normalizeEmail().isEmail().withMessage('Not a valid e-mail').custom(async value => {
            const user = await User.findOne({ email: value });
            if (!user) {
                throw new Error('No user with that email');
            }
        })
    ],
    authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password',
    [
        body('password', 'The Password need to be between 5-30 character length and alphanumeric').isLength({ min: 5, max: 30 }).isAlphanumeric(),
    ],
    authController.postNewPassword);


module.exports = router;
