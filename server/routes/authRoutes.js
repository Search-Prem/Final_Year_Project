const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/signup', controller.register);
router.post('/signin', controller.login);

module.exports = router;
