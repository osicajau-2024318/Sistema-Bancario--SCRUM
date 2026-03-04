// Importa Schema y model de mongoose para definir esquemas y crear modelos
import { Schema, model } from 'mongoose';

// Define el esquema de transacción bancaria
const transactionSchema = new Schema({
  // Nombre o descripción de la transacción
  transaction_name: {
    type: String,
    required: true
  },

  // Monto de la transacción
  transaction_amount: {
    type: Number,
    required: true,
    min: 0 // No puede ser negativo
  },

  // Tipo de transacción
  transaction_type: {
    type: String,
    enum: ['DEBITO', 'CREDITO', 'DEPOSITO', 'TRANSFERENCIA'],
    required: true
  },

  // Método de pago utilizado
  transaction_method_payment: {
    type: String,
    enum: ['TRANSFERENCIA', 'DEPOSITO', 'COMPRA', 'CREDITO'],
    default: 'DEPOSITO'
  },

  // Número de cuenta origen (para transferencias)
  from_account: {
    type: String,
    default: null
  },

  // Número de cuenta destino (para transferencias)
  to_account: {
    type: String,
    default: null
  },

  // Tasa de cambio usada (si hubo conversión de moneda)
  exchange_rate: {
    type: Number,
    default: null
  },

  // Moneda de origen (para conversiones)
  currency_from: {
    type: String,
    default: null
  },

  // Moneda de destino (para conversiones)
  currency_to: {
    type: String,
    default: null
  },

  // Número de promoción aplicada (si aplica)
  promotion_number: {
    type: String,
    default: null
  },

  // Título de la promoción
  promotion_title: {
    type: String,
    default: null
  },

  // Descripción de la promoción
  promotion_description: {
    type: String,
    default: null
  },

  // Fecha de inicio de la promoción
  promotion_date_start: {
    type: Date,
    default: null
  },

  // Fecha de finalización de la promoción
  promotion_date_finish: {
    type: Date,
    default: null
  },

  // Referencia a la cuenta asociada a esta transacción
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Account', // Relación con el modelo Account
    required: true
  },

  // ID del usuario dueño de la transacción (viene del servicio .NET PostgreSQL)
  user_id: {
    type: String, // ID from PostgreSQL
    required: true,
    maxlength: 16
  }, 
  
  // Indica si la transacción se puede revertir (por ejemplo, depósitos pendientes)
  revertible: { type: Boolean, default: false },
  // Indica si la transacción ya fue revertida
  reverted: { type: Boolean, default: false },

}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente


// Exporta el modelo Transaction basado en el esquema
export default model('Transaction', transactionSchema);