const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const isAuth = require('../middleware/is-auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);


module.exports = router;
