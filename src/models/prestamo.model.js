import { Schema, model } from "mongoose";

const prestamoSchema = new Schema({
    monto: {
        type: Number,
        required: true,
        min: 1
    },

    interes: {
        type: Number,
        required: true,
        min: 0
    },

    plazo: {
        type: Number, // meses
        required: true,
        min: 1
    },

    cuotaMensual: {
        type: Number,
        required: true
    },

    estado: {
        type: Boolean,
        default: true
    },

    usuario: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    cuenta: {
        type: Schema.Types.ObjectId,
        ref: "Cuenta",
        required: true
    }

}, {
    timestamps: true
});

export default model("Prestamo", prestamoSchema);
