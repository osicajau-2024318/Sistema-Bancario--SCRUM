import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['PRODUCTO', 'SERVICIO'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String, // Admin user ID from PostgreSQL
    required: true,
    maxlength: 16
  }
}, {
  timestamps: true
});

export default model('Product', productSchema);
