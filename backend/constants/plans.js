const plans = [
  { id: 1, name: '1 Day', days: 1, pricePerDay: 250, total: 250 },
  { id: 2, name: '5 Days', days: 5, pricePerDay: 240, total: 1200 },
  { id: 3, name: '12 Days', days: 12, pricePerDay: 230, total: 2760 },
  { id: 4, name: '25 Days', days: 25, pricePerDay: 220, total: 5500 }
];

function getPlanById(planId) {
  return plans.find((plan) => plan.id === Number(planId));
}

module.exports = { plans, getPlanById };
