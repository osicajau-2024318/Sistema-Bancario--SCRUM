// Importa Schema y model de mongoose para definir esquemas y crear modelos
import { Schema, model } from 'mongoose';

// Define el esquema de producto/servicio del banco
const productSchema = new Schema({
  // Nombre del producto o servicio
  name: {
    type: String,
    required: true,
    maxlength: 100 // Máximo 100 caracteres
  },
  // Descripción detallada
  description: {
    type: String,
    maxlength: 500 // Máximo 500 caracteres
  },
  // Tipo: producto físico o servicio
  type: {
    type: String,
    enum: ['PRODUCTO', 'SERVICIO'], // Solo acepta estos dos valores
    required: true
  },
  // Precio del producto/servicio
  price: {
    type: Number,
    required: true,
    min: 0 // No puede ser negativo
  },
  // Indica si el producto está activo y disponible
  is_active: {
    type: Boolean,
    default: true // Por defecto está activo
  },
  // ID del administrador que creó el producto (viene del servicio .NET PostgreSQL)
  created_by: {
    type: String, // Admin user ID from PostgreSQL
    required: true,
    maxlength: 16
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Exporta el modelo Product basado en el esquema
export default model('Product', productSchema);
