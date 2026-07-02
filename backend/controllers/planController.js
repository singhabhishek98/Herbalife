const { plans } = require('../constants/plans');

function listPlans(req, res) {
  res.json(plans);
}

module.exports = { listPlans };
