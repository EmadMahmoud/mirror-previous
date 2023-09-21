const express = require('express');
const router = express.Router();
const mirrorController = require('../controller/mirror');
const isAuth = require('../middleware/is-auth');


router.get('/profile', isAuth, mirrorController.getThings);
router.get('/add-thing', isAuth, mirrorController.getAddThing);
router.post('/add-thing', isAuth, mirrorController.postAddThing);
router.get('/thing-details/:thingId', isAuth, mirrorController.getThingDetails);
router.post('/delete-thing/:thingId', isAuth, mirrorController.postDeleteThing);
router.get('/edit-thing/:thingId', isAuth, mirrorController.getEditThing);
router.post('/edit-thing/:thingId', isAuth, mirrorController.postEditThing);


module.exports = router;