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

app.use(cors());
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
