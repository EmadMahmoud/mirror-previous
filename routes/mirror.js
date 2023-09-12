const express = require('express');
const router = express.Router();
const mirrorController = require('../controller/mirror');


router.post('/add-thing', mirrorController.addThing);

module.exports = router;