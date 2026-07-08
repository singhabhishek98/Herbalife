const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true, sparse: true },
    mobile: { type: String, unique: true, trim: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, default: null },
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
