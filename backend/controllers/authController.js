const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

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

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      teamId: Number(teamId) || 1
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

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  return res.json({
    message: `Password reset request received for ${email}`
  });
}

module.exports = { login, signup, forgotPassword };
