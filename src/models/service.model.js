import { Schema, model } from 'mongoose';

/**
 * Servicio/beneficio que ofrece el banco al cliente.
 * Solo el administrador crea y gestiona servicios (CRUD).
 * Opcionalmente se puede asignar a un cliente (assigned_to = user_id).
 */
const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String,
    required: true,
    maxlength: 64
  },
  assigned_to: {
    type: String,
    default: null,
    maxlength: 64
  }
}, { timestamps: true });

export default model('Service', serviceSchema);
