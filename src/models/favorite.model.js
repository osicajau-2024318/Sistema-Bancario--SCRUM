// Importa Schema y model de mongoose para definir esquemas y crear modelos
import { Schema, model } from 'mongoose';

// Define el esquema de cuentas favoritas (para facilitar transferencias frecuentes)
const favoriteSchema = new Schema({
  // Alias o nombre personalizado para la cuenta favorita
  alias: {
    type: String,
    required: true,
    trim: true, // Elimina espacios al inicio y final
    maxlength: 50
  },

  // Número de cuenta guardada como favorita
  account_number: {
    type: String,
    required: true,
    trim: true
  },

  // Tipo de la cuenta favorita
  account_type: {
    type: String,
    enum: ['AHORRO', 'CORRIENTE', 'NOMINA'],
    required: true
  },

  // ID del usuario dueño de esta lista de favoritos (viene del servicio .NET PostgreSQL)
  owner_user_id: {
    type: String, // ID from PostgreSQL
    required: true,
    maxlength: 16
  }

}, { timestamps: true }); // Agrega createdAt y updatedAt automáticamente

// Índice compuesto para evitar duplicados de alias por usuario
// Un usuario no puede tener dos favoritos con el mismo alias
favoriteSchema.index({ owner_user_id: 1, alias: 1 }, { unique: true });

// Índice compuesto para evitar agregar la misma cuenta dos veces
// Un usuario no puede agregar el mismo número de cuenta dos veces
favoriteSchema.index({ owner_user_id: 1, account_number: 1 }, { unique: true });

// Exporta el modelo Favorite basado en el esquema
export default model('Favorite', favoriteSchema);