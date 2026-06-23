import { Schema, model } from 'mongoose';

const servicePaymentSchema = new Schema(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    user_id: {
      type: String,
      required: true,
      maxlength: 16,
    },
    amount_requested: {
      type: Number,
      required: true,
      min: 0.01,
    },
    amount_debited: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency_from: {
      type: String,
      enum: ['GTQ', 'USD', 'EUR'],
      required: true,
    },
    currency_to: {
      type: String,
      enum: ['GTQ', 'USD', 'EUR'],
      required: true,
    },
    exchange_rate: {
      type: Number,
      default: null,
    },
    reference: {
      type: String,
      maxlength: 120,
      default: '',
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['COMPLETADO', 'FALLIDO'],
      default: 'COMPLETADO',
    },
  },
  { timestamps: true }
);

export default model('ServicePayment', servicePaymentSchema);
