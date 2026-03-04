import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  transaction_name: {
    type: String,
    required: true
  },

  transaction_amount: {
    type: Number,
    required: true,
    min: 0
  },

  transaction_type: {
    type: String,
    enum: ['DEBITO', 'CREDITO', 'DEPOSITO', 'TRANSFERENCIA'],
    required: true
  },

  transaction_method_payment: {
    type: String,
    enum: ['TRANSFERENCIA', 'DEPOSITO', 'COMPRA', 'CREDITO'],
    default: 'DEPOSITO'
  },

  from_account: {
    type: String,
    default: null
  },

  to_account: {
    type: String,
    default: null
  },

  exchange_rate: {
    type: Number,
    default: null
  },

  currency_from: {
    type: String,
    default: null
  },

  currency_to: {
    type: String,
    default: null
  },

  promotion_number: {
    type: String,
    default: null
  },

  promotion_title: {
    type: String,
    default: null
  },

  promotion_description: {
    type: String,
    default: null
  },

  promotion_date_start: {
    type: Date,
    default: null
  },

  promotion_date_finish: {
    type: Date,
    default: null
  },

  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },

  user_id: {
    type: String, // ID from PostgreSQL
    required: true,
    maxlength: 16
  }, 
  
  revertible: { type: Boolean, default: false }, // si se puede revertir
  reverted: { type: Boolean, default: false },  // si ya se ha revertido

}, { timestamps: true });


export default model('Transaction', transactionSchema);