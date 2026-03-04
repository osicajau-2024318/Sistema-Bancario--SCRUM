// Importa Schema y model de mongoose para definir esquemas y crear modelos
import { Schema, model } from 'mongoose';

// Define el esquema de la cuenta bancaria
const accountSchema = new Schema({
  // Número de cuenta bancaria único de 10 dígitos
  account_number: {
    type: String,
    unique: true, // Debe ser único en toda la base de datos
    required: true
  },

  // Saldo disponible en la cuenta
  balance: {
    type: Number,
    default: 0, // Por defecto inicia en 0
    min: 0 // No puede ser negativo
  },

  // Tipo de cuenta bancaria
  account_type: {
    type: String,
    enum: ['AHORRO', 'CORRIENTE', 'NOMINA'], // Solo acepta estos valores
    default: 'AHORRO'
  },

  // Moneda de la cuenta
  currency: {
    type: String,
    enum: ['GTQ', 'USD'], // Quetzales o Dólares
    default: 'GTQ'
  },

  // Límite total de transferencias por día (10,000)
  daily_transfer_limit: {
    type: Number,
    default: 10000
  },

  // Límite por cada transferencia individual (2,000)
  single_transfer_limit: {
    type: Number,
    default: 2000
  },

  // Contador de cuánto se ha transferido en el día actual
  daily_transferred_amount: {
    type: Number,
    default: 0
  },

  // Fecha de la última transferencia para resetear el contador diario
  last_transfer_date: {
    type: Date,
    default: null
  },

  // ID del usuario dueño de la cuenta (viene del servicio .NET)
  user_id: {
    type: String,
    required: true,
    maxlength: 16
  },

  // Estado de la cuenta
  estado: {
    type: String,
    enum: ['ACTIVA', 'BLOQUEADA', 'CERRADA', 'PENDIENTE'], // Estados posibles
    default: 'ACTIVA'
  }

}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

// Exporta el modelo Account basado en el esquema
export default model('Account', accountSchema);