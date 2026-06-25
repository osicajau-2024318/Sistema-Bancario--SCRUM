import { Schema, model } from 'mongoose';

const loanSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, enum: ['Crédito Automotriz', 'Consumo', 'Hipotecario', 'Personal'], default: 'Personal' },
  status: { type: String, enum: ['ACTIVO', 'PAGADO', 'CANCELADO'], default: 'ACTIVO' },
  principalAmount: { type: Number, required: true, min: 0 },
  outstandingBalance: { type: Number, default: 0, min: 0 },
  interestRate: { type: Number, default: 0, min: 0 },
  monthlyInstallment: { type: Number, default: 0, min: 0 },
  nextPaymentDate: { type: String },
  termRemaining: { type: String, maxlength: 50 },
  user_id: { type: String, required: true, maxlength: 16 },
}, { timestamps: true });

loanSchema.index({ user_id: 1 });

export default model('Loan', loanSchema);
