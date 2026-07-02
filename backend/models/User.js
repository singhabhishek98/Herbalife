const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    resetOtpHash: { type: String, default: null },
    resetOtpExpiresAt: { type: Date, default: null },
    resetOtpVerifiedAt: { type: Date, default: null },
    role: {
      type: String,
      enum: ['admin', 'head'],
      default: 'head'
    },
    teamId: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
