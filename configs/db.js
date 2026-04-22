'use strict';

// Importa mongoose para manejar la conexión a MongoDB
import mongoose from "mongoose";

// Función asíncrona que establece la conexión con MongoDB
export const dbConnection = async () => {
  try {
    console.log('MongoDB | intentando conectar a mongoDB');

    // Conecta a MongoDB usando la URI del archivo .env
    // serverSelectionTimeoutMS: tiempo máximo para seleccionar servidor (5 segundos)
    // maxPoolSize: número máximo de conexiones simultáneas en el pool (10)
    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    console.log('MongoDB | conectado a mongoDB');
    console.log('MongoDB | conectado a la base de datos SistemaBancario');

  } catch (error) {
    // Si hay error en la conexión, lo muestra y lanza el error
    console.error('MongoDB | ERROR al conectar:', error.message);
    throw error;
  }
};