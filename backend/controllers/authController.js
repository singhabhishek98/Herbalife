const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendOTP } = require('../services/emailService');

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      teamId: user.teamId,
      email: user.email
    },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId
  };
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function signup(req, res, next) {
  try {
    const { name, email, password, role = 'head', teamId = 1 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    let assignedTeamId = Number(teamId) || 1;
    if (role === 'head' && req.body.teamId === undefined) {
      const latestHead = await User.findOne({ role: 'head' }).sort({ teamId: -1 }).select('teamId');
      assignedTeamId = (latestHead?.teamId || 0) + 1;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      teamId: assignedTeamId
    });

    return res.status(201).json({
      token: createToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      token: createToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!process.env.BREVO_API_KEY || !process.env.FROM_EMAIL || !process.env.FROM_NAME) {
      return res.status(500).json({ message: 'Brevo email configuration is incomplete' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const otp = generateOtp();
    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtpVerifiedAt = null;
    await user.save();

    await sendOTP(user.email, otp);

    return res.json({
      message: 'OTP sent successfully to your registered email address.'
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyResetOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP request not found. Request a new OTP.' });
    }

    if (user.resetOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new OTP.' });
    }

    if (user.resetOtpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.resetOtpVerifiedAt = new Date();
    await user.save();

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: 'OTP request not found. Request a new OTP.' });
    }

    if (user.resetOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new OTP.' });
    }

    if (user.resetOtpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.resetOtpHash = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpVerifiedAt = null;
    await user.save();

    return res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, signup, forgotPassword, verifyResetOtp, resetPassword };
