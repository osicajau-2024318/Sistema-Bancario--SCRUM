import { Schema, model } from 'mongoose';

const accountSchema = new Schema({
  account_number: {
    type: String,
    unique: true,
    required: true
  },

  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  account_type: {
    type: String,
    enum: ['AHORRO', 'CORRIENTE', 'NOMINA'],
    default: 'AHORRO'
  },

  daily_transfer_limit: {
    type: Number,
    default: 10000
  },

  single_transfer_limit: {
    type: Number,
    default: 2000
  },

  daily_transferred_amount: {
    type: Number,
    default: 0
  },

  last_transfer_date: {
    type: Date,
    default: null
  },

  user_id: {
    type: String,
    required: true,
    maxlength: 16  // Compatible con PostgreSQL user ID
  },

  estado: {
    type: String,
    enum: ['ACTIVA', 'BLOQUEADA', 'CERRADA'],
    default: 'ACTIVA'
  }

}, { timestamps: true });

export default model('Account', accountSchema);