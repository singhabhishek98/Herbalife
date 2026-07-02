const express = require('express');
const { listVisits, markVisit } = require('../controllers/visitController');

const router = express.Router();

router.get('/', listVisits);
router.post('/', markVisit);

module.exports = router;
