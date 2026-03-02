'use strict';

import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    console.log('MongoDB | intentando conectar a mongoDB');

    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    console.log('MongoDB | conectado a mongoDB');
    console.log('MongoDB | conectado a la base de datos SistemaBancario');

  } catch (error) {
    console.error('MongoDB | ERROR al conectar:', error.message);
    throw error;
  }
};