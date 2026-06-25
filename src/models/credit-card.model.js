import { Schema, model } from 'mongoose';

const creditCardSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, enum: ['Visa', 'Mastercard', 'Amex'], default: 'Visa' },
  currency: { type: String, enum: ['GTQ', 'USD'], default: 'GTQ' },
  status: { type: String, enum: ['ACTIVA', 'BLOQUEADA', 'CERRADA'], default: 'ACTIVA' },
  authorizedLimit: { type: Number, required: true, min: 0 },
  balanceDue: { type: Number, default: 0, min: 0 },
  availableBalance: { type: Number, default: 0, min: 0 },
  minimumPayment: { type: Number, default: 0, min: 0 },
  fullPayment: { type: Number, default: 0, min: 0 },
  cutOffDate: { type: String },
  paymentDueDate: { type: String },
  user_id: { type: String, required: true, maxlength: 16 },
}, { timestamps: true });

creditCardSchema.index({ user_id: 1 });

export default model('CreditCard', creditCardSchema);
