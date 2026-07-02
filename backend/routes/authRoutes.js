const express = require('express');
const { login, signup, forgotPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);

module.exports = router;
