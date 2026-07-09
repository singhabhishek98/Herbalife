const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const teamRoutes = require('./routes/teamRoutes');
const visitRoutes = require('./routes/visitRoutes');
const { protect } = require('./middleware/authMiddleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://herbalife-one.vercel.app',
  'https://herbaclub.netlify.app'
];

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

function isAllowedDevOrigin(origin = '') {
  if (!origin.startsWith('http://')) {
    return false;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isAllowedDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Herbalife backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Herbalife backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', protect, memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/visits', protect, visitRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
