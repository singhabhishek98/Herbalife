require('dotenv').config();

const app = require('../app');
const connectDb = require('../config/db');

let connectionPromise;

function ensureDbConnection() {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = connectDb().catch((error) => {
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
}

module.exports = async (req, res) => {
  await ensureDbConnection();
  return app(req, res);
};
