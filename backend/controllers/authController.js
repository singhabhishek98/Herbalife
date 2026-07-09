const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const { sendOTP } = require('../services/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      teamId: user.teamId,
      email: user.email,
      mobile: user.mobile
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
    mobile: user.mobile,
    role: user.role,
    teamId: user.teamId,
    authProvider: user.googleId ? 'google' : 'password'
  };
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function normalizeMobile(mobile = '') {
  return mobile.replace(/\D/g, '');
}

function isEmailIdentifier(value = '') {
  return value.includes('@');
}

async function getNextHeadTeamId() {
  const latestHead = await User.findOne({ role: 'head' }).sort({ teamId: -1 }).select('teamId');
  return (latestHead?.teamId || 0) + 1;
}

async function signup(req, res, next) {
  try {
    const { name, email, mobile, identifier, password, role = 'head', teamId = 1 } = req.body;
    const rawIdentifier = (identifier || '').trim();
    const normalizedEmail = email ? normalizeEmail(email) : (isEmailIdentifier(rawIdentifier) ? normalizeEmail(rawIdentifier) : '');
    const normalizedMobile = mobile ? normalizeMobile(mobile) : (!isEmailIdentifier(rawIdentifier) ? normalizeMobile(rawIdentifier) : '');

    if (!name || (!normalizedEmail && !normalizedMobile) || !password) {
      return res.status(400).json({ message: 'Name, mobile number or email, and password are required' });
    }

    if (normalizedMobile && normalizedMobile.length < 10) {
      return res.status(400).json({ message: 'Enter a valid mobile number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingMobile = await User.findOne({ mobile: normalizedMobile });
    if (existingMobile) {
      return res.status(409).json({ message: 'Mobile number already registered' });
    }

    if (normalizedEmail) {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already registered' });
      }
    }

    let assignedTeamId = Number(teamId) || 1;
    if (role === 'head' && req.body.teamId === undefined) {
      assignedTeamId = await getNextHeadTeamId();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail || undefined,
      mobile: normalizedMobile || undefined,
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
    const { identifier, email, mobile, password } = req.body;
    const loginIdentifier = (identifier || email || mobile || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Email or mobile number and password are required' });
    }

    const query = isEmailIdentifier(loginIdentifier)
      ? { email: normalizeEmail(loginIdentifier) }
      : { mobile: normalizeMobile(loginIdentifier) };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Continue with Google.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    return res.json({
      token: createToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function googleAuth(req, res, next) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign-In is not configured on the server' });
    }

    const { credential, accessToken, mode = 'login' } = req.body;
    let payload;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } else if (accessToken) {
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!profileResponse.ok) {
        return res.status(400).json({ message: 'Unable to verify Google account' });
      }

      payload = await profileResponse.json();
    } else {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!payload?.sub || !payload?.email || !payload?.email_verified) {
      return res.status(400).json({ message: 'Unable to verify Google account' });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }]
    });

    if (!user) {
      if (mode !== 'signup') {
        return res.status(404).json({ message: 'No account found for this Google account. Please sign up first.' });
      }

      const assignedTeamId = await getNextHeadTeamId();
      user = await User.create({
        name: payload.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId: payload.sub,
        role: 'head',
        teamId: assignedTeamId
      });
    } else if (!user.googleId) {
      if (mode !== 'signup') {
        return res.status(400).json({ message: 'This account was created with password login. Use your password or sign up with Google to link it.' });
      }

      user.googleId = payload.sub;
      if (!user.email) {
        user.email = normalizedEmail;
      }
      await user.save();
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

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Continue with Google.' });
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

    const user = await User.findOne({ email: normalizeEmail(email) });
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

    const user = await User.findOne({ email: normalizeEmail(email) });
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

module.exports = { login, signup, googleAuth, forgotPassword, verifyResetOtp, resetPassword };
