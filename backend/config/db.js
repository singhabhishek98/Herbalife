const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'herbalife'
  });
}

module.exports = connectDb;
