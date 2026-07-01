const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
