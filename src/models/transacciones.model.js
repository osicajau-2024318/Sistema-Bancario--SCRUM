import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transaccionSchema = new Schema(
  {
    tipo: {
      type: String,
      enum: ["DEPOSITO", "RETIRO", "TRANSFERENCIA"],
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    cuentaOrigen: {
      type: Schema.Types.ObjectId,
      ref: "Cuenta",
      required: true,
    },
    cuentaDestino: {
      type: Schema.Types.ObjectId,
      ref: "Cuenta",
      default: null,
    },
    estado: {
      type: Boolean,
      default: true, 
    },
  },
  {
    timestamps: true,
  }
);

export default model("Transaccion", transaccionSchema);
