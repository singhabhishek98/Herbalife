const express = require('express');
const { markVisit } = require('../controllers/visitController');

const router = express.Router();

router.post('/', markVisit);

module.exports = router;
