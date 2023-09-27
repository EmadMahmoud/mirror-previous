const express = require('express');
const router = express.Router();
const mirrorController = require('../controller/mirror');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

router.get('/profile', isAuth, mirrorController.getThings);
router.get('/add-thing', isAuth, mirrorController.getAddThing);
router.post('/add-thing', isAuth,
    [
        body('category', 'Not a valid Category').notEmpty().isIn(['movies', 'tv-shows', 'books', 'songs']),
        body('name', 'Not a valid Name').notEmpty().trim().isAlphanumeric().isLength({ min: 2, max: 100 }).withMessage('name must be between 2-100 characters'),
        body('comment', 'Not a valid Comment').trim().isLength({ min: 2, max: 1500 }).withMessage('comment must be between 2-1500 characters')
    ],
    mirrorController.postAddThing);
router.get('/thing-details/:thingId', isAuth, mirrorController.getThingDetails);
router.post('/delete-thing/:thingId', isAuth, mirrorController.postDeleteThing);
router.get('/edit-thing/:thingId', isAuth, mirrorController.getEditThing);
router.post('/edit-thing/:thingId',
    [
        body('category', 'Not a valid Category').notEmpty().isIn(['movies', 'tv-shows', 'books', 'songs']),
        body('name', 'Not a valid Name').notEmpty().trim().isAlphanumeric().isLength({ min: 2, max: 100 }).withMessage('name must be between 2-100 characters'),
        body('comment', 'Not a valid Comment').trim().isLength({ min: 2, max: 1500 }).withMessage('comment must be between 2-1500 characters')
    ],
    isAuth, mirrorController.postEditThing);


module.exports = router;