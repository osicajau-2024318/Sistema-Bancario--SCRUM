import { Schema, model } from "mongoose";

const cuentaSchema = new Schema({
    numeroCuenta: {
        type: String,
        required: true,
        unique: true
    },

    saldo: {
        type: Number,
        default: 0
    },

    tipo: {
        type: String,
        enum: ["ahorro", "monetaria"],
        required: true
    },

    usuario: {
        type: Schema.Types.ObjectId,
        ref: "User",   // referencia al modelo User
        required: true
    }
}, {
    timestamps: true
});

export default model("Cuenta", cuentaSchema);
