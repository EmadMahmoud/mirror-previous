const express = require('express');
const router = express.Router();
const mirrorController = require('../controller/mirror');

//edit-thing post, get
//delete-thing post
//thing-details get

router.get('/profile', mirrorController.getThings)
router.get('/add-thing', mirrorController.getAddThing)
router.post('/add-thing', mirrorController.postAddThing);
module.exports = router;