const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'herbalife'
  });

  return mongoose.connection;
}

module.exports = connectDb;
