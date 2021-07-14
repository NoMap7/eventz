const express = require('express');
const router = express.Router();
const viewsController = require('./../controllers/viewsController');

router.use('/', viewsController.getHome);

module.exports = router;
