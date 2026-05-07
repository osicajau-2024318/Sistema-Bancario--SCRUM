/**
 * Conexión a MongoDB con mongoose.
 * Exporta una función async que conecta usando la URI del .env.
 */

import mongoose from 'mongoose';

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log('MongoDB | Conectado correctamente');
  } catch (error) {
    console.error('MongoDB | Error al conectar:', error.message);
    throw error;
  }
};
