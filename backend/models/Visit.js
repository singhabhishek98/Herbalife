const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

visitSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Visit', visitSchema);
