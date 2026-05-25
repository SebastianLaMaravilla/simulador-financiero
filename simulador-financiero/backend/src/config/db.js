const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI no está definida.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  console.log('✅ MongoDB conectado');
}

module.exports = connectDB;
