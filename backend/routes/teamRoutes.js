const express = require('express');
const { listTeams } = require('../controllers/teamController');

const router = express.Router();

router.get('/', listTeams);

module.exports = router;
