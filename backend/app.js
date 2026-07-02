const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Herbalife backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Herbalife backend is running' });
});

app.get('/api/members', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', status: 'Active' },
    { id: 2, name: 'Jane Smith', status: 'Pending' }
  ]);
});

app.post('/api/members', (req, res) => {
  const member = req.body;
  res.status(201).json({ message: 'Member received', member });
});

module.exports = app;
