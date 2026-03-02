import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema({
  alias: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  account_number: {
    type: String,
    required: true,
    trim: true
  },

  account_type: {
    type: String,
    enum: ['AHORRO', 'CORRIENTE', 'NOMINA'],
    required: true
  },

  owner_user_id: {
    type: String, // ID from PostgreSQL
    required: true,
    maxlength: 16
  }

}, { timestamps: true });

// Índice para evitar duplicados de alias por usuario
favoriteSchema.index({ owner_user_id: 1, alias: 1 }, { unique: true });

// Índice para evitar agregar la misma cuenta dos veces
favoriteSchema.index({ owner_user_id: 1, account_number: 1 }, { unique: true });

export default model('Favorite', favoriteSchema);