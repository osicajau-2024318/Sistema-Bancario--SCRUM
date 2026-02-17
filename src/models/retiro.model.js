import { Schema, model } from "mongoose";

const retiroSchema = new Schema(
    {
        monto: {
            type: Number,
            required: [true, "El monto es obligatorio"],
            min: [0, "El monto no puede ser negativo"]
        },
        descripcion: {
            type: String,
            trim: true
        },
        estado: {
            type: Boolean,
            default: true
        },
        cuenta: {
            type: Schema.Types.ObjectId,
            ref: "Cuenta",
            required: [true, "La cuenta es obligatoria"]
        },
        usuario: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default model("Retiro", retiroSchema);
