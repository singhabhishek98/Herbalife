require('dotenv').config();

const app = require('./app');
const connectDb = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  });
