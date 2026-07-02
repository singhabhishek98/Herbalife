const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    teamId: { type: Number, required: true },
    planId: { type: Number, required: true },
    startDate: { type: String, required: true },
    remainingDays: { type: Number, required: true, min: 0 },
    lastVisit: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid'
    },
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
