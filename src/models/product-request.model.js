import { Schema, model } from 'mongoose';

const productRequestSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user_id: {
      type: String,
      required: true,
      maxlength: 16,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    admin_notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO'],
      default: 'PENDIENTE',
    },
    reviewed_by: {
      type: String,
      maxlength: 16,
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productRequestSchema.index({ product_id: 1, user_id: 1, status: 1 });

export default model('ProductRequest', productRequestSchema);
