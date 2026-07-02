const { teams } = require('../constants/teams');

function listTeams(req, res) {
  res.json(teams);
}

module.exports = { listTeams };
